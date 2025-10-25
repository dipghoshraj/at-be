const _ = require("lodash");
const Joi = require("joi");

class HeaderEditApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.headerLogic = container.resolve("headerLogic");
  }

  async handleRequest(req, res) {
    const tableHeaderName = _.get(req, "body.headerName", null);
    const operation = _.get(req, "body.operation", null);
    const data = _.get(req, "body.data", []);
    const editHeaderPayload = {
      headerName: tableHeaderName,
      operation: operation,
      data: data,
    };
    const [headerErr, headerRes] = await this.utility.invoker(
      this.headerLogic.handleHeaderEdit(editHeaderPayload)
    );

    if (headerErr) {
      return res.status(400).send({
        msg: "FETCH FAILED !!",
        error: true,
        errorReport: headerErr,
      });
    }
    return res
      .status(200)
      .send({ error: false, msg: "FETCH SUCCESSFULLY !!", d: headerRes });
  }
}

module.exports = HeaderEditApi;
