const bcrypt = require("bcrypt");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

class Utility {
  invoker(promise) {
    return promise
      .then((data) => {
        return [null, data];
      })
      .catch((err) => {
        return [err, null];
      });
  }

  async maskInput(inputToBeMasked) {
    return await bcrypt.hash(inputToBeMasked, 10);
  }

  async unMaskInput(maskedPassword, userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword, maskedPassword);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  createUpdateQuery(table, data) {
    const keys = Object.keys(data).filter((k) => data[k]);
    const names = keys.map((k, index) => k + " = $" + (index + 1)).join(", ");
    const values = keys.map((k) => data[k]);
    return {
      query: "UPDATE " + table + " SET " + names,
      params: values,
    };
  }

  processCsvData(csvData) {
    return new Promise((resolve, reject) => {
      const bufferStream = new Readable();
      bufferStream.push(csvData);
      bufferStream.push(null);

      const results = [];

      bufferStream
        .pipe(csvParser())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
  }

  convertObjToCsvStr(listOfObj = []) {
    const csvHeader = Object.keys(listOfObj[0]).join(",");
    const csvData = listOfObj
      .map((row) => {
        return Object.values(row)
          .map((v) => (!v || v == "undefined" ? "-" : `"${v}"`))
          .join(",");
      })
      .join("\n");
    return `${csvHeader}\n${csvData}`;
  }

  createReportFormat(data, dataFormat, dataFillUpFunc) {
    const reportOutput = {
      year: "",
      monthWise: {
        jan: new dataFormat(),
        feb: new dataFormat(),
        mar: new dataFormat(),
        apr: new dataFormat(),
        may: new dataFormat(),
        jun: new dataFormat(),
        jul: new dataFormat(),
        aug: new dataFormat(),
        sep: new dataFormat(),
        oct: new dataFormat(),
        nov: new dataFormat(),
        dec: new dataFormat(),
        janNextYear: new dataFormat(),
      },
    };
    const months = Object.keys(reportOutput?.monthWise).filter(
      (m) => m !== "janNextYear"
    );
    const currentDate = new Date();
    const dataForYear =
      currentDate?.getMonth() == 0
        ? currentDate?.getFullYear() - 1
        : currentDate?.getFullYear();
    const nextYear = dataForYear + 1;
    const currentYearData = data.filter(({ created_at }) => {
      const recordedYear = new Date(created_at)?.getFullYear();
      return recordedYear === dataForYear;
    });
    const nextYearData = data.filter(({ created_at }) => {
      const recordedYear = new Date(created_at)?.getFullYear();
      const recordedMonth = new Date(created_at)?.getMonth();
      return recordedYear === nextYear && recordedMonth == 0;
    });
    months?.forEach(dataFillUpFunc(reportOutput, currentYearData));
    months
      .slice(0, 1)
      ?.forEach(dataFillUpFunc(reportOutput, nextYearData, "janNextYear"));
    reportOutput.year = `${dataForYear}-${nextYear}`;
    return reportOutput;
  }
}

module.exports = Utility;
