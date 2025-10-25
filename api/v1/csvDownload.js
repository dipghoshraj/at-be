const _ = require("lodash");
const Joi = require("joi");

class CsvDownloadApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.dataTableLogic = container.resolve("dataTableLogic");
  }

  async handleRequest(req, res) {
    const table = _.get(req, "body.relation", null);
    const filter = _.get(req, "body.filter", []);
    const output = _.get(req, "body.output", "data");
    const csvDownloadPayload = {
      table: table,
      filter: filter,
      output: output,
      isAllTable: true,
    };

    if (!csvDownloadPayload.table) {
      return res
        .status(400)
        .send({ error: true, msg: "NO RELATION MENTIONED !!" });
    }

    const [downloadErr, downloadRes] = await this.utility.invoker(
      this.dataTableLogic.handleCsvDownload(csvDownloadPayload)
    );

    if (downloadErr) {
      return res.status(400).send({
        msg: "DOWNLOAD FAILED !!",
        error: true,
        errorReport: downloadErr,
      });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment;filename=data.csv");

    return res.status(200).send({
      error: false,
      msg: "DOWLOADED SUCCESSFULLY !!",
      r: downloadRes,
    });
  }
}

module.exports = CsvDownloadApi;
