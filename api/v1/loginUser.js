const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class LoginUser {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.constants = container.resolve("constants");
    this.userLogic = container.resolve("userLogic");
  }

  async updateUserToken(userId, token) {
    const [err, insertRes] = await this.utility.invoker(
      this.userLogic.updateUserRecordDb(userId, ["session_token"], [token])
    );

    const userInfo = _.get(_.get(insertRes, "rows", []), "0", {});
    if (err || !userInfo) return Promise.reject(err);
    return Promise.resolve(!!userInfo);
  }

  async handleRequest(req, res) {
    const userInfo = {
      profilePic: _.get(req, "user.profile_pic", null),
      fullName: _.get(req, "user.fullname", null),
      email: _.get(req, "user.email", null),
      phone: _.get(req, "user.phone", null),
      userRole: _.get(req, "user.user_role", null),
      referrerId: _.get(req, "user.referrer_id", null),
      userId: _.get(req, "user.id", null),
    };

    req.login(userInfo, { session: false }, async (err) => {
      if (err) {
        console.error("Error logging in:", err);
        return res.sendStatus(500);
      }
      const buffer = crypto.randomBytes(16); // 16 bytes
      const randomHex = buffer.toString("hex");
      const body = {
        email: userInfo.email,
        userId: userInfo.userId,
        userRole: userInfo.userRole,
        timestamp: Date.now(),
        randomHex,
      };
      const token = jwt.sign({ user: body }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      const [updatedTokenErr, updatedTokenRes] = await this.utility.invoker(
        this.updateUserToken(userInfo.userId, token)
      );

      if (updatedTokenErr) {
        return res.status(500).send({
          errorReport: JSON.stringify(updatedTokenErr),
          error: true,
          msg: "USER LOGIN FAILED!!",
        });
      }

      const [errUserAcessTabs, userAccessTabs] = await this.utility.invoker(
        this.userLogic.getUserAccess(userInfo.userId)
      );

      let userTabs = {};

      if (errUserAcessTabs) {
        userTabs = {};
      } else {
        const userAccess = _.get(_.get(userAccessTabs, "rows", []), "0", {});
        for (const key in userAccess) {
          if (userAccess[key] && userAccess[key] !== "null") {
            userTabs[key] = userAccess[key];
          }
        }
        delete userTabs.id;
        delete userTabs.userid;
      }

      const userScreenedData = {
        profilePic: userInfo?.profilePic,
        fullName: userInfo?.fullName,
        email: userInfo?.email,
        phone: userInfo?.phone,
        userRole: userInfo?.userRole,
        userTabs: userTabs,
      };

      return res.status(200).send(
        JSON.stringify({
          msg: "USER LOGIN SUCCESSFULL!!",
          userDetails: userScreenedData,
          token: token,
          error: false,
        })
      );
    });
  }
}

module.exports = LoginUser;
