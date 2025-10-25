const _ = require("lodash");
const Joi = require("joi");

class UserRoleApi {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.userLogic = container.resolve("userLogic");
  }

  async handleRequest(req, res) {
    const userDetail = _.get(req, "user", null);
    const [roleErr, roleRes] = await this.utility.invoker(
      this.userLogic.handleUserRole(userDetail.userId)
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
      .send({ error: false, msg: "FETCH SUCCESSFULLY !!", r: roleRes });
  }
}

module.exports = UserRoleApi;
