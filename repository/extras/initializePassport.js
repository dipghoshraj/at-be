const _ = require("lodash");
const LocalStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

class Passport {
  constructor(container) {
    this.userData = container.resolve("userData");
    this.utility = container.resolve("utility");
    this.table = "dashboardusers";
    this.reqToken = null;
    this.authenticateUser = this.authenticateUser.bind(this);
    this.authenticateJWTtoken = this.authenticateJWTtoken.bind(this);
  }

  async authenticateUser(enteredEmail, enteredPassword, done) {
    const [err, userResponseArr] = await this.utility.invoker(
      this.userData.fetchAllUserMatches("email", enteredEmail)
    );
    if (err) {
      done(err);
    }
    if (userResponseArr.length) {
      const password = userResponseArr[0].user_password;
      const isMatch = await this.utility.unMaskInput(password, enteredPassword);
      if (isMatch) {
        done(null, userResponseArr[0], {
          message: "Authentication Successfull!!",
        });
      } else {
        done(null, false, { message: "Incorrect Password!!" });
      }
    } else {
      done(null, false, { message: "Incorrect EmailId!!" });
    }
  }

  async authenticateJWTtoken(jwt_payload, done) {
    const [err, userResponseArr] = await this.utility.invoker(
      this.userData.fetchAllUserMatches("id", jwt_payload?.user?.userId)
    );
    const userToken = _.get(
      _.get(userResponseArr, "0", {}),
      "session_token",
      null
    );
    if (err) {
      done(err);
    }
    try {
      if (this.reqToken === userToken) {
        return done(null, jwt_payload.user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      done(error);
    }
  }

  passportInit(passport, next) {
    passport.use(
      "userSession",
      new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        this.authenticateUser
      )
    );
    passport.use(
      new JWTstrategy(
        {
          secretOrKey: process.env.ACCESS_TOKEN_SECRET,
          jwtFromRequest: (req) => {
            this.reqToken = req.header("authorization").split(" ")[1] || null;
            // return ExtractJWT.fromAuthHeaderAsBearerToken();
            return this.reqToken;
          },
        },
        this.authenticateJWTtoken
      )
    );
    passport.serializeUser((userData, done) => done(null, userData.email));
    passport.deserializeUser(async (mail, done) => {
      const [err, userResponseArr] = await this.utility.invoker(
        this.userData.fetchAllUserMatches("email", mail)
      );
      if (err) done(err);
      done(null, userResponseArr[0]);
    });
    next();
  }
}

module.exports = Passport;
