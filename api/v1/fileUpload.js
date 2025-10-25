const _ = require("lodash");
const Joi = require("joi");

class FileUploadApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.dataTableLogic = container.resolve("dataTableLogic");
  }

  async handleRequest(req, res) {
    const file = _.get(req, "file", null);

    if (!file) {
      return res.status(400).send({ error: true, msg: "NO FILE UPLOADED !!" });
    }

    const [uploadErr, uploadRes] = await this.utility.invoker(
      this.dataTableLogic.handleFileUpload(file)
    );

    if (uploadErr) {
      return res.status(400).send({
        msg: "UPLOAD FAILED !!",
        error: true,
        errorReport: uploadErr,
      });
    }
    return res.status(200).send({
      error: false,
      msg: "UPLOAD SUCCESSFULLY !!",
      fileLocation: uploadRes?.fileLocation,
    });
  }
}

module.exports = FileUploadApi;
