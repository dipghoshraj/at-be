const _ = require("lodash");
const Joi = require("joi");

class ListTableApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.dataTableLogic = container.resolve("dataTableLogic");
  }

  async handleRequest(req, res) {
    const table = _.get(req, "body.relation", null);
    const filter = _.get(req, "body.filter", []);
    const page = _.get(req, "query.page", "1");
    const limit = 10;
    const offset = (_.parseInt(page) - 1) * _.parseInt(limit);
    const listPayload = {
      page: page,
      limit: limit,
      offset: offset,
      table: table,
      filter: filter,
    };
    if (!table || !page || !limit) {
      return res.status(400).send({ error: true, msg: "INSUFFICIENT DATA !!" });
    }

    const [listErr, listRes] = await this.utility.invoker(
      this.dataTableLogic.handleTableList(listPayload)
    );

    if (listErr) {
      return res.status(400).send({
        msg: "FETCH FAILED !!",
        error: true,
        errorReport: listErr,
      });
    }
    return res
      .status(200)
      .send({ error: false, msg: "FETCH SUCCESSFULLY !!", d: listRes });
  }
}

module.exports = ListTableApi;
