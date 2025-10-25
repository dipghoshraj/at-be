const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyparser = require("body-parser");
const session = require("express-session");
const router = require("./api/router");

const server = (container) =>
  new Promise((resolve) => {
    const app = express();
    app.use(
      bodyparser.urlencoded({
        extended: true,
      })
    );
    app.use(
      bodyparser.json({
        limit: "10mb",
        strict: false,
      })
    );
    app.use(morgan("dev"));
    app.use(
      cors({
        origin: (origin, callback) => {
          const whitelist = ["http://localhost:3000", "http://16.170.253.217"];
          console.log("REQUEST FROM ORIGIN: ", origin);
          if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: [
          "content-type",
          "credentials",
          "authorization",
          "accesstoken",
        ],
      })
    );
    app.use(
      session({
        secret: "youdontgettoseethisitsoursecret",
        resave: false,
        saveUninitialized: false,
      })
    );
    app.use((req, res, next) => {
      req.container = container.createScope();
      next();
    });
    // app.use("/api-gateway/*", (req, res) => {
    //   const remainingPath = req.params[0];
    //   res.redirect(301, `/${remainingPath}`);
    // });
    app.get("/", (req, res) => {
      res.status(200).send("Hello from AT Data Service");
    });
    app.use("/at-data-service", router);

    resolve(app);
  });

module.exports = server;
