const _ = require("lodash");

class HeaderTableLogic {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.postgresDB = container.resolve("postgresDB");
    this.constants = container.resolve("constants");
    this.headerTable = "tableHeaders";
    this.handleAddHeaderToIndex = this.handleAddHeaderToIndex.bind(this);
    this.handleEditHeaderToIndex = this.handleEditHeaderToIndex.bind(this);
    this.handleDeleteHeaderToIndex = this.handleDeleteHeaderToIndex.bind(this);
  }

  handleListFetch(headerTableName = "") {
    const query = `SELECT * FROM ${this.headerTable} 
        WHERE table_name = '${headerTableName}'`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  handleAddHeaderToIndex(table, index, value) {
    const query = `UPDATE ${this.headerTable}
    SET headers = headers[1:${index}] || ARRAY['${value}'] || headers[${
      Number(index) + 1
    }:]
    WHERE table_name = '${table}'
    RETURNING *`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  handleEditHeaderToIndex(table, index, value) {
    const query = `UPDATE ${this.headerTable}
    SET headers[${Number(index) + 1}] = $1
    WHERE table_name = '${table}'
    RETURNING *`;
    const params = [value];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  handleDeleteHeaderToIndex(table, index, value) {
    const query = `UPDATE ${this.headerTable}
    SET headers = ARRAY_REMOVE(headers, headers[${Number(index) + 1}])
    WHERE table_name = '${table}'
    RETURNING *`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleHeaderEdit(editHeaderPayload) {
    const {
      headerName = "",
      operation = "",
      data = ["", ""],
    } = editHeaderPayload;

    if (!headerName || !operation || !data.length)
      return Promise.reject("Err: No Table Name !!");

    let handleFunc;

    if (operation === "add") {
      handleFunc = this.handleAddHeaderToIndex;
    }
    if (operation === "edit") {
      handleFunc = this.handleEditHeaderToIndex;
    }
    if (operation === "delete") {
      handleFunc = this.handleDeleteHeaderToIndex;
    }

    if (!handleFunc) {
      return Promise.reject("Err: Operation requested is not handled !!");
    }

    const [headerUpdateErr, headerUpdateRes] = await this.utility.invoker(
      handleFunc(headerName, data[0], data[1])
    );
    if (headerUpdateErr) return Promise.reject(headerUpdateErr);

    const headerListFetched = _.get(headerUpdateRes, "rows", []);

    return Promise.resolve(headerListFetched);
  }

  async handleHeaderList(tableHeader) {
    if (!tableHeader) return Promise.reject("Err: No Table Name !!");

    const [headerListErr, headerListRes] = await this.utility.invoker(
      this.handleListFetch(tableHeader)
    );
    if (headerListErr) return Promise.reject(headerListErr);

    const headerListFetched = _.get(headerListRes, "rows", []);
    return Promise.resolve(headerListFetched);
  }
}

module.exports = HeaderTableLogic;
