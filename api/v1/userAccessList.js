const _ = require("lodash");
const Joi = require("joi");

class UserAccessListApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.userLogic = container.resolve("userLogic");
  }

  async handleRequest(req, res) {
    const userDetails = _.get(req, "user", {});
    const [roleErr, roleRes] = await this.utility.invoker(
      this.userLogic.handleUserAccessList(userDetails?.userId)
    );

    if (roleErr) {
      return res.status(400).send({
        msg: "FETCH FAILED !!",
        error: true,
        errorReport: roleErr,
      });
    }
    return res
      .status(200)
      .send({ error: false, msg: "FETCH SUCCESSFULLY !!", a: roleRes });
  }
}

module.exports = UserAccessListApi;
