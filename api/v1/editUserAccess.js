const _ = require("lodash");
const Joi = require("joi");

class UserAccessListApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.userLogic = container.resolve("userLogic");
  }

  async handleRequest(req, res) {
    const updatedData = _.get(req, "body.updatedData", []);
    const accessId = _.get(req, "body.accessId", []);
    const editAcessPayload = {
      updatedData: updatedData,
      accessId: accessId,
    };
    const [insertErr, insertRes] = await this.utility.invoker(
      this.userLogic.handleUserAccessEdit(editAcessPayload)
    );

    if (insertErr) {
      return res.status(400).send({
        msg: "DATA UPDATED FAILED !!",
        error: true,
        errorReport: insertErr,
      });
    }
    return res
      .status(200)
      .send({ error: false, msg: "DATA UPDATED SUCCESSFULLY !!" });
  }
}

module.exports = UserAccessListApi;
