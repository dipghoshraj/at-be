const _ = require("lodash");

class DataTableLogic {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.postgresDB = container.resolve("postgresDB");
    this.constants = container.resolve("constants");
    this.awsS3 = container.resolve("awsS3");
    this.sheetData = [];
    this.handleCsvRecord = this.handleCsvRecord.bind(this);
    this.handleBulkInsert = this.handleBulkInsert.bind(this);
    this.handleTableFetch = this.handleTableFetch.bind(this);
    this.handleBulkUpdateData = this.handleBulkUpdateData.bind(this);
    this.handleGetTablesCount = this.handleGetTablesCount.bind(this);
    this.getTableCount = this.getTableCount.bind(this);
    this.handleDashboardCounts = this.handleDashboardCounts.bind(this);
    this.handleBulkDelete = this.handleBulkDelete.bind(this);
    this.convertDataToRehabReport = this.convertDataToRehabReport.bind(this);
    this.convertDataToRescueReport = this.convertDataToRescueReport.bind(this);
    this.defaultTexts = {
      approval_status: "pending approval",
      admin_remarks: "",
    };
    this.tablesForDashboard = [
      "fieldvisits",
      "projectRescue",
      "projectGobiShelter",
      "projectAdmittedToOtherHomes",
      "projectRehabilitationHomeClients",
      "projectECRC",
      "project5A",
      "projectAwarenessProgram",
      "projectHumanitarianServices",
      "outPatientServices",
    ];
    this.dateKeys = [
      "outreach_date",
      "rescue_date",
      "admission_date",
      "date_of_abscond",
      "abscond_date",
      "date_of_visit",
      "informer_date",
      "enquire_date",
      "date_of_info",
      "admit_date",
    ];
  }

  async getTableCount(table, filter) {
    const condition = !!filter.length
      ? filter
          .map((cond) =>
            cond.includes("<>")
              ? cond
                  .map((v, i) => {
                    if (i === 0) {
                      return this.dateKeys.includes(v) ? v : `(${v}::integer)`;
                    }
                    if (v.includes(",") || i === 2) {
                      const customVal = v.split(",");
                      return `${customVal[0]} AND ${
                        customVal[1] || customVal[0]
                      }`;
                    }
                    return v === "<>" ? "BETWEEN" : v;
                  })
                  .join(" ")
              : cond
                  .map((c, i) => (i == cond.length - 1 ? `'${c}'` : c))
                  .join(" ")
          )
          .join(" AND ")
      : "";

    const query = `SELECT COUNT(*) FROM ${table} ${
      !!filter.length
        ? `WHERE ${
            condition.includes("date") && condition.includes("BETWEEN")
              ? condition
                  .split(" ")
                  .map((w) => (w.includes("-") ? `'${w}'` : w))
                  .join(" ")
              : condition
          }`
        : ""
    }`;

    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleGetTablesCount(countPayload = {}) {
    const { tableFor: fortable = "", filter } = countPayload;
    const obj = {};
    const tables = fortable ? [fortable] : this.tablesForDashboard;
    const unresolvedPromise = _.map(tables, async (table) => {
      return this.getTableCount(table, filter);
    });

    const [resolveErr, resolvedRes] = await this.utility.invoker(
      Promise.all(unresolvedPromise)
    );

    if (resolveErr) {
      return Promise.reject(resolveErr);
    }

    _.forEach(resolvedRes, (val, index) => {
      const count = _.get(_.get(val, "rows", []), "0", {});
      obj[tables[index]] = count.count || 0;
    });

    return Promise.resolve(obj);
  }

  async handleDeleteRows(table, row = {}) {
    const query = `DELETE FROM ${table}
    WHERE id = ${row?.id}
    `;
    const params = [];

    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleBulkDelete(table, dataToDelete = []) {
    if (!table) return Promise.reject("NO Table Name !!");
    const deletePromises = dataToDelete.map((data) => {
      return this.handleDeleteRows(table, data);
    });
    return Promise.all(deletePromises);
  }

  async handleBulkInsert(currentTable, dataArray) {
    if (!currentTable) return Promise.reject(null);

    const regex = /'/g;
    const columnsList = this.constants.table[currentTable]?.columns;
    const values = dataArray.map(
      (obj, i) =>
        `(${columnsList
          .map(
            (col) =>
              `'${
                this.defaultTexts[col]
                  ? this.defaultTexts[col]
                  : obj[col]?.replace(regex, "")
              }'`
          )
          .join(", ")})`
    );
    const columnsStr = columnsList?.join(", ");
    const query = `INSERT INTO ${currentTable} (${columnsStr}) VALUES ${values}
      RETURNING *`;

    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleBulkUpdateData(currentTable, renewedData) {
    if (!currentTable) return Promise.reject(null);

    const columnsList = this.constants.table[currentTable]?.columns;
    const columnsListWithId = [
      "id",
      ...(this.constants.table[currentTable]?.columns || []),
    ];
    const refcolumns = columnsList
      .map((col, i) => `${col} = new_value_${i + 1}`)
      ?.join(", ");
    const refcolumnsOnlyWithoutRelations = columnsList
      .map((_, i) => `new_value_${i + 1}`)
      ?.join(", ");
    const values = renewedData.map(
      (obj, i) =>
        `(${columnsListWithId
          .map(
            (col) =>
              `'${this.defaultTexts[col] ? this.defaultTexts[col] : obj[col]}'`
          )
          .join(", ")})`
    );
    const query = `UPDATE ${currentTable} SET ${refcolumns} FROM (VALUES ${values}) AS updated_data(id, ${refcolumnsOnlyWithoutRelations})
    WHERE ${currentTable}.id = CAST(updated_data.id AS bigint) AND ${currentTable}.approval_status <> 'deleted' AND ${currentTable}.approval_status <> 'approved'
    RETURNING *`;

    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleBulkDataApproval(currentTable, renewedData) {
    if (!currentTable) return Promise.reject(null);

    const columnsList = this.constants.table[currentTable]?.columns;
    const columnsListWithId = ["id", ...(columnsList || [])];
    const refcolumns = columnsList
      .map((col, i) => `${col} = new_value_${i + 1}`)
      ?.join(", ");
    const refcolumnsOnlyWithoutRelations = columnsList
      .map((_, i) => `new_value_${i + 1}`)
      ?.join(", ");
    const values = renewedData.map(
      (obj, i) =>
        `(${columnsListWithId.map((col) => `'${obj[col]}'`).join(", ")})`
    );
    const query = `UPDATE ${currentTable} SET ${refcolumns} FROM (VALUES ${values}) AS updated_data(id, ${refcolumnsOnlyWithoutRelations})
    WHERE ${currentTable}.id = CAST(updated_data.id AS bigint)
    RETURNING *`;

    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleTableFetch(
    currentTable,
    { limit, offset, filter = [], isAllTable = false }
  ) {
    if (!currentTable) return Promise.reject(null);

    const condition = !!filter.length
      ? filter
          .map((cond) =>
            cond.includes("<>")
              ? cond
                  .map((v, i) => {
                    if (i === 0) {
                      return this.dateKeys.includes(v) ? v : `(${v}::integer)`;
                    }
                    if (v.includes(",") || i === 2) {
                      const customVal = v.split(",");
                      return `${customVal[0]} AND ${
                        customVal[1] || customVal[0]
                      }`;
                    }
                    return v === "<>" ? "BETWEEN" : v;
                  })
                  .join(" ")
              : cond
                  .map((c, i) => (i == cond.length - 1 ? `'${c}'` : c))
                  .join(" ")
          )
          .join(" AND ")
      : "";

    const query = `SELECT * FROM ${currentTable} ${
      !!filter.length
        ? `WHERE ${
            condition.includes("date") && condition.includes("BETWEEN")
              ? condition
                  .split(" ")
                  .map((w) => (w.includes("-") ? `'${w}'` : w))
                  .join(" ")
              : condition
          }`
        : ""
    } ORDER BY sort_order DESC ${
      !isAllTable ? `LIMIT ${limit} OFFSET ${offset}` : ""
    }`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleTableList(listPayload) {
    const { table: listTable } = listPayload;
    if (!listTable) return Promise.reject("Err: No Table Name !!");

    const [listFetchErr, listFetchRes] = await this.utility.invoker(
      this.handleTableFetch(listTable, listPayload)
    );
    if (listFetchErr) return Promise.reject(listFetchErr);

    const listFetched = _.get(listFetchRes, "rows", []);
    return Promise.resolve(listFetched);
  }

  async handleCsvRecord(csvPayload) {
    const table = csvPayload.relation;
    const csvData = csvPayload.file.buffer.toString();

    if (!table || !csvData)
      return Promise.reject("Err: No Table Name or Proper CSV !!");

    const [errParsingCsv, parsedCsvData] = await this.utility.invoker(
      this.utility.processCsvData(csvData)
    );

    if (errParsingCsv) {
      return Promise.reject(errParsingCsv);
    }

    const [errInsertingCsvDataToDb, ResinsertingCsvDataToDb] =
      await this.utility.invoker(this.handleBulkInsert(table, parsedCsvData));

    if (errInsertingCsvDataToDb) {
      return Promise.reject(errInsertingCsvDataToDb);
    }
    const rowData = _.get(ResinsertingCsvDataToDb, "rows", []);

    return Promise.resolve(rowData);
  }

  async handleEditTableDatas(editPayload) {
    const table = editPayload.table;
    const renewedData = editPayload.data;

    const [editDataErr, editDataRes] = await this.utility.invoker(
      this.handleBulkUpdateData(table, renewedData)
    );

    if (editDataErr) {
      return Promise.reject(editDataErr);
    }

    return Promise.resolve(!!editDataRes);
  }

  async handleTableDatasApproval(editPayload) {
    const table = editPayload.table;
    const renewedData = editPayload.data;

    const hardDeletionData = renewedData.filter(
      ({ approval_status }) => approval_status === "hard deleted"
    );

    const remainingData = renewedData.filter(
      ({ approval_status }) => approval_status !== "hard deleted"
    );

    if (hardDeletionData.length) {
      const [deleteDataErr, deleteDataRes] = await this.utility.invoker(
        this.handleBulkDelete(table, hardDeletionData)
      );

      if (deleteDataErr) {
        return Promise.reject(deleteDataErr);
      }
    }

    if (!remainingData.length)
      return Promise.resolve("Data Deleted Successful !!");

    const [editDataErr, editDataRes] = await this.utility.invoker(
      this.handleBulkDataApproval(table, remainingData)
    );

    if (editDataErr) {
      return Promise.reject(editDataErr);
    }

    return Promise.resolve(!!editDataRes);
  }

  async handleDashboardCounts(countPayload = {}) {
    const [err, response] = await this.utility.invoker(
      this.handleGetTablesCount(countPayload)
    );

    if (err) {
      return Promise.reject(err);
    }
    return Promise.resolve(response);
  }

  async handleFileUpload(file) {
    const [fileUploadErr, fileUploadLocation] = await this.utility.invoker(
      this.awsS3.uploadFiles(file)
    );

    if (fileUploadErr) {
      // res.end();
      return Promise.reject(fileUploadErr);
    }
    return Promise.resolve({ fileLocation: fileUploadLocation });
  }

  convertDataToRehabReport(data) {
    class MonthlyDataFormat {
      totalCount = 0;
      male = 0;
      female = 0;
      differentlyAbled = 0;
      mentallyRetarded = 0;
      substanceAbuse = 0;
      accidentVictims = 0;
      mentallyIll = 0;
      leftOverByTheirFamily = 0;
      dyingDestitute = 0;
      affectedByDisease = 0;
      unableToWalk = 0;
      age = {
        "20-40": 0,
        "41-59": 0,
        "60-69": 0,
        "70-79": 0,
        "80+": 0,
        "100+": 0,
      };
    }
    const fillDataFunc =
      (reportObj, yearData, customMonthKey = "") =>
      (month, monthIndex) => {
        const monthName = customMonthKey || month;
        const monthWiseData = yearData?.filter(
          ({ created_at }) => new Date(created_at)?.getMonth() === monthIndex
        );
        reportObj.monthWise[monthName].totalCount = monthWiseData.length;
        reportObj.monthWise[monthName].male = monthWiseData?.filter(
          ({ gender }) => gender.toLowerCase() === "male"
        ).length;
        reportObj.monthWise[monthName].female = monthWiseData?.filter(
          ({ gender }) => gender.toLowerCase() === "female"
        ).length;
        reportObj.monthWise[monthName].differentlyAbled = monthWiseData?.filter(
          ({ health_condition }) =>
            health_condition.replaceAll(" ", "").toLowerCase() ===
            "differentlyAbled".toLowerCase()
        ).length;
        reportObj.monthWise[monthName].mentallyRetarded = monthWiseData?.filter(
          ({ health_condition }) =>
            health_condition.replaceAll(" ", "").toLowerCase() ===
            "mentallyRetarded".toLowerCase()
        ).length;
        reportObj.monthWise[monthName].substanceAbuse = monthWiseData?.filter(
          ({ health_condition }) =>
            health_condition.replaceAll(" ", "").toLowerCase() ===
            "substanceAbuse".toLowerCase()
        ).length;
        reportObj.monthWise[monthName].accidentVictims = monthWiseData?.filter(
          ({ health_condition }) =>
            health_condition.replaceAll(" ", "").toLowerCase() ===
            "accidentVictims".toLowerCase()
        ).length;
        reportObj.monthWise[monthName].mentallyIll = monthWiseData?.filter(
          ({ health_condition }) =>
            health_condition.replaceAll(" ", "").toLowerCase() ===
            "mentallyIll".toLowerCase()
        ).length;
        reportObj.monthWise[monthName].leftOverByTheirFamily =
          monthWiseData?.filter(
            ({ health_condition }) =>
              health_condition.replaceAll(" ", "").toLowerCase() ===
              "leftOverByTheirFamily".toLowerCase()
          ).length;
        reportObj.monthWise[monthName].dyingDestitute = monthWiseData?.filter(
          ({ health_condition }) =>
            health_condition.replaceAll(" ", "").toLowerCase() ===
            "dyingDestitute".toLowerCase()
        ).length;
        reportObj.monthWise[monthName].affectedByDisease =
          monthWiseData?.filter(
            ({ health_condition }) =>
              health_condition.replaceAll(" ", "").toLowerCase() ===
              "affectedByDisease".toLowerCase()
          ).length;
        reportObj.monthWise[monthName].unableToWalk = monthWiseData?.filter(
          ({ health_condition }) =>
            health_condition.replaceAll(" ", "").toLowerCase() ===
            "unableToWalk".toLowerCase()
        ).length;
        reportObj.monthWise[monthName].age["20-40"] = monthWiseData?.filter(
          ({ age }) => Number(age) > 19 && Number(age) < 41
        ).length;
        reportObj.monthWise[monthName].age["41-59"] = monthWiseData?.filter(
          ({ age }) => Number(age) > 40 && Number(age) < 60
        ).length;
        reportObj.monthWise[monthName].age["60-69"] = monthWiseData?.filter(
          ({ age }) => Number(age) > 59 && Number(age) < 70
        ).length;
        reportObj.monthWise[monthName].age["70-79"] = monthWiseData?.filter(
          ({ age }) => Number(age) > 69 && Number(age) < 80
        ).length;
        reportObj.monthWise[monthName].age["80+"] = monthWiseData?.filter(
          ({ age }) => Number(age) > 79 && Number(age) < 100
        ).length;
        reportObj.monthWise[monthName].age["100+"] = monthWiseData?.filter(
          ({ age }) => Number(age) > 99
        ).length;
      };

    return this.utility.createReportFormat(
      data,
      MonthlyDataFormat,
      fillDataFunc
    );
  }

  generateReportForRehab(reportObj) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const csvHeader = ["Years", "Particulars", ...months, "Jan", "Total"];
    const extractTotalCountOfEachMonth = Object.keys(reportObj?.monthWise).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.totalCount
    );
    const line1 = [
      reportObj.year,
      "",
      ...extractTotalCountOfEachMonth,
      extractTotalCountOfEachMonth.reduce((a, b) => a + b),
    ];
    const line2 = csvHeader.map(() => ",");
    const extractMaleCountOfEachMonth = Object.keys(reportObj?.monthWise).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.male
    );
    const line3 = [
      "Gender Factor",
      "Male",
      ...extractMaleCountOfEachMonth,
      extractMaleCountOfEachMonth.reduce((a, b) => a + b),
    ];
    const extractFemaleCountOfEachMonth = Object.keys(reportObj?.monthWise).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.female
    );
    const line4 = [
      "",
      "Female",
      ...extractFemaleCountOfEachMonth,
      extractFemaleCountOfEachMonth.reduce((a, b) => a + b),
    ];
    const line5 = csvHeader.map(() => ",");

    const extractDifferentlyAbledCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.differentlyAbled);

    const line6 = [
      "Biological Factor",
      "Differently abled",
      ...extractDifferentlyAbledCountOfEachMonth,
      extractDifferentlyAbledCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractMentallyRetardedCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.mentallyRetarded);

    const line7 = [
      "",
      "Mentally Retarded",
      ...extractMentallyRetardedCountOfEachMonth,
      extractMentallyRetardedCountOfEachMonth.reduce((a, b) => a + b),
    ];
    const line8 = csvHeader.map(() => ",");

    const extractSubstanceAbuseCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.substanceAbuse);

    const line9 = [
      "Social Factor",
      "Substance abuse",
      ...extractSubstanceAbuseCountOfEachMonth,
      extractSubstanceAbuseCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractAccidentVictimsCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.accidentVictims);

    const line10 = [
      "",
      "Accident Victims",
      ...extractAccidentVictimsCountOfEachMonth,
      extractAccidentVictimsCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractMentallyIllCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.mentallyIll);

    const line11 = [
      "",
      "Mentally ill",
      ...extractMentallyIllCountOfEachMonth,
      extractMentallyIllCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractLeftOverByTheirFamilyCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.leftOverByTheirFamily);

    const line12 = [
      "",
      "Left over by their Family",
      ...extractLeftOverByTheirFamilyCountOfEachMonth,
      extractLeftOverByTheirFamilyCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line13 = csvHeader.map(() => ",");

    const extractDyingDestituteCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.dyingDestitute);

    const line14 = [
      "Physical Factor",
      "Dying destitute",
      ...extractDyingDestituteCountOfEachMonth,
      extractDyingDestituteCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractAffectedByDiseaseCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.affectedByDisease);

    const line15 = [
      "",
      "Affected by disease",
      ...extractAffectedByDiseaseCountOfEachMonth,
      extractAffectedByDiseaseCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractUnableToWalkCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.unableToWalk);

    const line16 = [
      "",
      "Unable to walk",
      ...extractUnableToWalkCountOfEachMonth,
      extractUnableToWalkCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line17 = csvHeader.map(() => ",");

    const extractAge2040CountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.age["20-40"] || 0);

    const line18 = [
      "Age Factor",
      "20 - 40 -Adulthood (add 11)",
      ...extractAge2040CountOfEachMonth,
      extractAge2040CountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractAge4159CountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.age["41-59"] || 0);

    const line19 = [
      "",
      "41 - 59 -Middle Age",
      ...extractAge4159CountOfEachMonth,
      extractAge4159CountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractAge6069CountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.age["60-69"] || 0);

    const line20 = [
      "",
      "60 - 69 -Young old",
      ...extractAge6069CountOfEachMonth,
      extractAge6069CountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractAge7079CountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.age["70-79"] || 0);

    const line21 = [
      "",
      "70 - 79 - Middle old",
      ...extractAge7079CountOfEachMonth,
      extractAge7079CountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractAge80CountOfEachMonth = Object.keys(reportObj?.monthWise).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.age["80+"] || 0
    );

    const line22 = [
      "",
      "80+ - oldest old or frail old",
      ...extractAge80CountOfEachMonth,
      extractAge80CountOfEachMonth.reduce((a, b) => a + b),
    ];

    const extractAge100CountOfEachMonth = Object.keys(reportObj?.monthWise).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.age["100+"] || 0
    );

    const line23 = [
      "",
      "100+ - Centurion",
      ...extractAge100CountOfEachMonth,
      extractAge100CountOfEachMonth.reduce((a, b) => a + b),
    ];
    const line24 = [
      "Total",
      ...Array(14).fill(""),
      extractTotalCountOfEachMonth.reduce((a, b) => a + b),
    ];

    return `${csvHeader}\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}\n${line6}\n${line7}\n${line8}\n${line9}\n${line10}\n${line11}\n${line12}\n${line13}\n${line14}\n${line15}\n${line16}\n${line17}\n${line18}\n${line19}\n${line20}\n${line21}\n${line22}\n${line23}\n${line24}`;
  }

  convertDataToRescueReport(data) {
    class MonthlyDataFormat {
      totalCount = 0;
      reunitedWithFamily = 0;
      jobOpportunity = 0;
      admittedInOldAgeHome = 0;
      admittedInMentallyIllHome = 0;
      admittedInAtchayamRehabilitationHome = 0;
      admittedInECRC = 0;
      admittedInGobiNightShelterHome = 0;
      nulmCuddlore = 0;
      providingMedicalCare = 0;
      covidReliefCamp = 0;
      referToDeaddictionCenter = 0;
      handoverToSocialWelfareDepartment = 0;
    }

    const fillDataFunc =
      (reportObj, yearData, customMonthKey = "") =>
      (month, monthIndex) => {
        const monthName = customMonthKey || month;
        const monthWiseData = yearData?.filter(
          ({ created_at }) => new Date(created_at)?.getMonth() === monthIndex
        );
        reportObj.monthWise[monthName].totalCount = monthWiseData.length;

        reportObj.monthWise[monthName].reunitedWithFamily =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "reunitedWithFamily".toLowerCase()
          ).length;

        reportObj.monthWise[monthName].jobOpportunity = monthWiseData?.filter(
          ({ social_reintegration }) =>
            social_reintegration.replaceAll(" ", "").toLowerCase() ===
            "jobOpportunity".toLowerCase()
        ).length;

        reportObj.monthWise[monthName].admittedInOldAgeHome =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "admittedInOldAgeHome".toLowerCase()
          ).length;

        reportObj.monthWise[monthName].admittedInMentallyIllHome =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "admittedInMentallyIllHome".toLowerCase()
          ).length;

        reportObj.monthWise[monthName].admittedInAtchayamRehabilitationHome =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "admittedInAtchayamRehabilitationHome".toLowerCase()
          ).length;

        reportObj.monthWise[monthName].admittedInECRC = monthWiseData?.filter(
          ({ social_reintegration }) =>
            social_reintegration.replaceAll(" ", "").toLowerCase() ===
            "admittedInECRC".toLowerCase()
        ).length;

        reportObj.monthWise[monthName].admittedInGobiNightShelterHome =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "admittedInGobiNightShelterHome".toLowerCase()
          ).length;

        reportObj.monthWise[monthName].nulmCuddlore = monthWiseData?.filter(
          ({ social_reintegration }) =>
            social_reintegration.replaceAll(" ", "").toLowerCase() ===
            "nulmCuddlore".toLowerCase()
        ).length;

        reportObj.monthWise[monthName].providingMedicalCare =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "providingMedicalCare".toLowerCase()
          ).length;

        reportObj.monthWise[monthName].covidReliefCamp = monthWiseData?.filter(
          ({ social_reintegration }) =>
            social_reintegration.replaceAll(" ", "").toLowerCase() ===
            "covidReliefCamp".toLowerCase()
        ).length;

        reportObj.monthWise[monthName].referToDeaddictionCenter =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "referToDeaddictionCenter".toLowerCase()
          ).length;

        reportObj.monthWise[monthName].handoverToSocialWelfareDepartment =
          monthWiseData?.filter(
            ({ social_reintegration }) =>
              social_reintegration.replaceAll(" ", "").toLowerCase() ===
              "handoverToSocialWelfareDepartment".toLowerCase()
          ).length;
      };

    return this.utility.createReportFormat(
      data,
      MonthlyDataFormat,
      fillDataFunc
    );
  }

  generateReportForRescue(reportObj) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const csvHeader = ["Years", "Particulars", ...months, "Jan", "Total"];

    const line1 = [reportObj.year, ...Array(15).fill("")];

    const line2 = csvHeader.map(() => ",");

    const extractReunitedWithFamilyCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.reunitedWithFamily);

    const line3 = [
      "New After Life Rehabilitation",
      "Reunited With Family",
      ...extractReunitedWithFamilyCountOfEachMonth,
      extractReunitedWithFamilyCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line4 = csvHeader.map(() => ",");

    const extractJobOpportunityCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.jobOpportunity);

    const line5 = [
      "",
      "Job Opportunity",
      ...extractJobOpportunityCountOfEachMonth,
      extractJobOpportunityCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line6 = csvHeader.map(() => ",");

    const extractAdmittedInOldAgeHomeCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.admittedInOldAgeHome);

    const line7 = [
      "For Rehabilitation",
      "Admitted In old Age Home",
      ...extractAdmittedInOldAgeHomeCountOfEachMonth,
      extractAdmittedInOldAgeHomeCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line8 = csvHeader.map(() => ",");

    const extractAdmittedInMentallyIllHomeCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.admittedInMentallyIllHome
    );

    const line9 = [
      "",
      "Admitted in Mentally ill Home",
      ...extractAdmittedInMentallyIllHomeCountOfEachMonth,
      extractAdmittedInMentallyIllHomeCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line10 = csvHeader.map(() => ",");

    const extractAdmittedInAtchayamRehabilitationHomeCountOfEachMonth =
      Object.keys(reportObj?.monthWise).map(
        (monthKey) =>
          reportObj?.monthWise[monthKey]?.admittedInAtchayamRehabilitationHome
      );

    const line11 = [
      "",
      "Admitted in Atchayam Rehabilitation Home",
      ...extractAdmittedInAtchayamRehabilitationHomeCountOfEachMonth,
      extractAdmittedInAtchayamRehabilitationHomeCountOfEachMonth.reduce(
        (a, b) => a + b
      ),
    ];

    const line12 = csvHeader.map(() => ",");

    const extractAdmittedInECRCCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.admittedInECRC);

    const line13 = [
      "",
      "Admitted in ECRC",
      ...extractAdmittedInECRCCountOfEachMonth,
      extractAdmittedInECRCCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line14 = csvHeader.map(() => ",");

    const extractAdmittedInGobiNightShelterHomeCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map(
      (monthKey) =>
        reportObj?.monthWise[monthKey]?.admittedInGobiNightShelterHome
    );

    const line15 = [
      "",
      "Admitted in Gobi Night shlter home",
      ...extractAdmittedInGobiNightShelterHomeCountOfEachMonth,
      extractAdmittedInGobiNightShelterHomeCountOfEachMonth.reduce(
        (a, b) => a + b
      ),
    ];

    const line16 = csvHeader.map(() => ",");

    const extractNulmCuddloreCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.nulmCuddlore);

    const line17 = [
      "",
      "NULM - Cuddlore",
      ...extractNulmCuddloreCountOfEachMonth,
      extractNulmCuddloreCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line18 = csvHeader.map(() => ",");

    const extractProvidingMedicalCareCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.providingMedicalCare);

    const line19 = [
      "Other Rehabilitation Acitivity",
      "Providing Medical Care",
      ...extractProvidingMedicalCareCountOfEachMonth,
      extractProvidingMedicalCareCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line20 = csvHeader.map(() => ",");

    const extractCovidReliefCampCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map((monthKey) => reportObj?.monthWise[monthKey]?.covidReliefCamp);

    const line21 = [
      "",
      "Covid Relief Camp",
      ...extractCovidReliefCampCountOfEachMonth,
      extractCovidReliefCampCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line22 = csvHeader.map(() => ",");

    const extractReferToDeaddictionCenterCountOfEachMonth = Object.keys(
      reportObj?.monthWise
    ).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.referToDeaddictionCenter
    );

    const line23 = [
      "",
      "Refer to de addiction Center",
      ...extractReferToDeaddictionCenterCountOfEachMonth,
      extractReferToDeaddictionCenterCountOfEachMonth.reduce((a, b) => a + b),
    ];

    const line24 = csvHeader.map(() => ",");

    const extractHandoverToSocialWelfareDepartmentCountOfEachMonth =
      Object.keys(reportObj?.monthWise).map(
        (monthKey) =>
          reportObj?.monthWise[monthKey]?.handoverToSocialWelfareDepartment
      );

    const line25 = [
      "",
      "Handover to Social Welfare Department",
      ...extractHandoverToSocialWelfareDepartmentCountOfEachMonth,
      extractHandoverToSocialWelfareDepartmentCountOfEachMonth.reduce(
        (a, b) => a + b
      ),
    ];

    const line26 = csvHeader.map(() => ",");

    const extracttotalCountOfEachMonth = Object.keys(reportObj?.monthWise).map(
      (monthKey) => reportObj?.monthWise[monthKey]?.totalCount
    );

    const line27 = [
      "TOTAL",
      "",
      ...extracttotalCountOfEachMonth,
      extracttotalCountOfEachMonth.reduce((a, b) => a + b),
    ];

    return `${csvHeader}\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}\n${line6}\n${line7}\n${line8}\n${line9}\n${line10}\n${line11}\n${line12}\n${line13}\n${line14}\n${line15}\n${line16}\n${line17}\n${line18}\n${line19}\n${line20}\n${line21}\n${line22}\n${line23}\n${line24}\n${line25}\n${line26}\n${line27}`;
  }

  async handleCsvDownload(csvPayload) {
    const { table, output } = csvPayload;

    if (!table) return Promise.reject("Err: No Table Name or Proper CSV !!");

    const [listFetchErr, listFetchRes] = await this.utility.invoker(
      this.handleTableFetch(table, csvPayload)
    );

    if (listFetchErr) return Promise.reject(listFetchErr);

    const listFetched = _.get(listFetchRes, "rows", []);

    if (output == "report" && table === "projectRehabilitationHomeClients") {
      const rehabReport = this.convertDataToRehabReport(listFetched);
      const csvStrings = this.generateReportForRehab(rehabReport);
      return Promise.resolve(csvStrings);
    }

    if (output == "report" && table === "projectRescue") {
      const rescueReport = this.convertDataToRescueReport(listFetched);
      const csvStrings = this.generateReportForRescue(rescueReport);
      return Promise.resolve(csvStrings);
    }

    const screenFields = ["sort_order", "id", "created_at", "gallery_id"];

    const doctoredList = listFetched.map((data) => {
      screenFields.forEach((screenThisKey) => {
        if (screenThisKey in data) delete data[screenThisKey];
      });
      return data;
    });

    const csvStrings = this.utility.convertObjToCsvStr(doctoredList);

    return Promise.resolve(csvStrings);
  }
}

module.exports = DataTableLogic;
