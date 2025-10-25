const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class LogoutUser {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.constants = container.resolve("constants");
    this.userLogic = container.resolve("userLogic");
  }

  async updateUserToken(userId) {
    const [err, insertRes] = await this.utility.invoker(
      this.userLogic.updateUserRecordDb(userId, ["session_token"], [null])
    );

    const userInfo = _.get(_.get(insertRes, "rows", []), "0", {});
    if (err || !userInfo) return Promise.reject(err);
    return Promise.resolve(!!userInfo);
  }

  async handleRequest(req, res, next) {
    const userData = _.get(req, "user", {});

    req.logout(async (err) => {
      if (err) {
        return next(err);
      }

      const [updatedTokenErr, updatedTokenRes] = await this.utility.invoker(
        this.updateUserToken(userData.userId)
      );

      if (updatedTokenErr) {
        return res.status(500).send({
          errorReport: JSON.stringify(updatedTokenErr),
          msg: "USER LOGOUT FAILED!!",
          error: true,
        });
      }

      res.redirect("/");
    });
  }
}

module.exports = LogoutUser;
