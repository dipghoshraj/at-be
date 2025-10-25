const _ = require("lodash");
const Joi = require("joi");

class UserRegister {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.userLogic = container.resolve("userLogic");
    this.userData = container.resolve("userData");
  }

  async handleRequest(req, res) {
    const params = {
      profilePic: _.get(req, "body.profilePic", null),
      fullName: _.get(req, "body.fullName", null),
      email: _.get(req, "body.email", null),
      phone: _.get(req, "body.phone", null),
      password: _.get(req, "body.password", null),
    };

    const {
      isValid,
      validatedInput: validatedParams,
      validationError,
    } = this.validateInput(params);

    if (!isValid) {
      return res
        .status(400)
        .send({ error: true, errorReport: validationError });
    }

    const [err, isNewUser] = await this.utility.invoker(
      this.userData.checkUserRegistered(params)
    );

    if (err || !isNewUser) {
      const errMsg = !isNewUser
        ? { msg: "USER ALREADY REGISTERED", error: true }
        : { error: true, errorReport: err };
      return res.status(409).send(errMsg);
    }

    const [registerErr, isRegistered] = await this.utility.invoker(
      this.userLogic.handleUserRegister(isNewUser, validatedParams)
    );

    if (registerErr || !isRegistered) {
      const errMsg = !isRegistered
        ? { msg: "ISSUE WITH REGISTERING RECORD...", error: true }
        : { error: true, errorReport: registerErr };
      return res.status(500).send(errMsg);
    }

    return res
      .status(200)
      .send({ msg: "USER REGISTERED SUCCESSFULLY !!", error: false });
  }

  getInputSchema() {
    if (!_.isNil(this.inputSchema)) {
      return this.inputSchema;
    }
    this.inputSchema = Joi.object({
      profilePic: Joi.string().allow(null),
      fullName: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      password: Joi.string().required(),
    });
    return this.inputSchema;
  }

  validateInput(input) {
    const inputSchema = this.getInputSchema();
    const validationRes = inputSchema.validate(input);
    return {
      isValid: _.isNil(validationRes.error),
      validatedInput: validationRes.value,
      validationError: validationRes.error,
    };
  }
}

module.exports = UserRegister;
