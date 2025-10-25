const _ = require("lodash");
const passport = require("passport");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const adminValidator = async (req, res, next) => {
  const userDetail = _.get(req, "user", null);
  const table = _.get(req, "body.relation", null);
  const userLogic = req.container.resolve("userLogic");
  const utility = req.container.resolve("utility");
  const userAccessTable = "userTabAccess";
  const isUserAccessTable = table === userAccessTable;
  const getUserRoleAndAccess = isUserAccessTable
    ? userLogic.getUserRole
    : userLogic.getUserAccess;

  const [errGetUserAccess, userAccessRes] = await utility.invoker(
    getUserRoleAndAccess(userDetail.userId)
  );

  const userAccessData = _.get(_.get(userAccessRes, "rows", []), "0", {});

  if (errGetUserAccess) {
    res.status(500).send("Internal Server Error");
  }

  if (isUserAccessTable && userAccessData?.user_role === "admin") {
    return next();
  }

  if (
    !isUserAccessTable &&
    userAccessData[table?.toLowerCase()] &&
    userAccessData[table?.toLowerCase()] !== "null" &&
    userAccessData[table?.toLowerCase()] === "admin"
  ) {
    return next();
  }

  res.status(403).send("Access Denied !!");
};

const writerValidator = async (req, res, next) => {
  const userDetail = _.get(req, "user", null);
  const table = _.get(req, "body.relation", null);
  const userLogic = req.container.resolve("userLogic");
  const utility = req.container.resolve("utility");

  const [errGetUserAccess, userAccessRes] = await utility.invoker(
    userLogic.getUserAccess(userDetail.userId)
  );

  const userAccessData = _.get(_.get(userAccessRes, "rows", []), "0", {});

  if (errGetUserAccess) {
    res.status(500).send("Internal Server Error");
  }

  if (
    userAccessData[table.toLowerCase()] &&
    userAccessData[table.toLowerCase()] !== "null" &&
    userAccessData[table.toLowerCase()] !== "viewer"
  ) {
    return next();
  }
  res.status(403).send("Access Denied !!");
};

const viewerValidator = async (req, res, next) => {
  const userDetail = _.get(req, "user", null);
  const table = _.get(req, "body.relation", null);
  const userLogic = req.container.resolve("userLogic");
  const utility = req.container.resolve("utility");

  const [errGetUserAccess, userAccessRes] = await utility.invoker(
    userLogic.getUserAccess(userDetail.userId)
  );

  const userAccessData = _.get(_.get(userAccessRes, "rows", []), "0", {});

  if (errGetUserAccess) {
    res.status(500).send("Internal Server Error");
  }

  if (
    userAccessData[table.toLowerCase()] &&
    userAccessData[table.toLowerCase()] !== "null"
  ) {
    return next();
  }

  res.status(403).send("Access Denied !!");
};

module.exports = { adminValidator, writerValidator, viewerValidator };
