const _ = require("lodash");
const Joi = require("joi");

class TableWiseCountApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.dataTableLogic = container.resolve("dataTableLogic");
  }

  async handleRequest(req, res) {
    const tableFor = _.get(req, "query.for", null);
    const filter = _.get(req, "body.filter", []);
    const countPayload = {
      tableFor: tableFor,
      filter: filter,
    };

    const [countErr, countRes] = await this.utility.invoker(
      this.dataTableLogic.handleDashboardCounts(countPayload)
    );

    if (countErr) {
      return res.status(400).send({
        msg: "FETCH FAILED !!",
        error: true,
        errorReport: countErr,
      });
    }
    return res
      .status(200)
      .send({ error: false, msg: "FETCH SUCCESSFULLY !!", c: countRes });
  }
}

module.exports = TableWiseCountApi;
