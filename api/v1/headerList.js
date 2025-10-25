const _ = require("lodash");
const Joi = require("joi");

class HeaderListApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.headerLogic = container.resolve("headerLogic");
  }

  async handleRequest(req, res) {
    const tableHeaderName = _.get(req, "body.headerName", null);
    const [headerErr, headerRes] = await this.utility.invoker(
      this.headerLogic.handleHeaderList(tableHeaderName)
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

module.exports = HeaderListApi;
