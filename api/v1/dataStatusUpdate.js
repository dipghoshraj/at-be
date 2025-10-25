const _ = require("lodash");
const Joi = require("joi");

class DataStatusUpdateApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.dataTableLogic = container.resolve("dataTableLogic");
  }

  async handleRequest(req, res) {
    const table = _.get(req, "body.relation", null);
    const data = _.get(req, "body.updatedData", []);
    const editPayload = {
      data: data,
      table: table,
    };

    if (!table || !data.length) {
      return res.status(400).send({ error: true, msg: "INSUFFICIENT DATA !!" });
    }

    const [listErr, listRes] = await this.utility.invoker(
      this.dataTableLogic.handleTableDatasApproval(editPayload)
    );

    if (listErr) {
      return res.status(400).send({
        msg: "DATA UPDATED FAILED !!",
        error: true,
        errorReport: listErr,
      });
    }
    return res
      .status(200)
      .send({ error: false, msg: "DATA UPDATED SUCCESSFULLY !!" });
  }
}

module.exports = DataStatusUpdateApi;
