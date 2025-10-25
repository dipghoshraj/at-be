const _ = require("lodash");
const Joi = require("joi");

class CsvUploadApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.dataTableLogic = container.resolve("dataTableLogic");
  }

  async handleRequest(req, res) {
    const csvPayload = {
      relation: _.get(req, "body.relation", null),
      file: _.get(req, "file", null),
    };

    if (!csvPayload.file) {
      return res.status(400).send({ error: true, msg: "NO FILE UPLOADED !!" });
    }

    const [uploadErr, uploadRes] = await this.utility.invoker(
      this.dataTableLogic.handleCsvRecord(csvPayload)
    );

    if (uploadErr) {
      return res.status(400).send({
        msg: "UPLOAD FAILED !!",
        error: true,
        errorReport: uploadErr,
      });
    }
    return res
      .status(200)
      .send({ error: false, msg: "UPLOAD SUCCESSFULLY !!" });
  }
}

module.exports = CsvUploadApi;
