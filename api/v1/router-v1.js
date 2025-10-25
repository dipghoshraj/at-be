const express = require("express");
const passport = require("passport");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const helpers = require("../../helpers");
const router = express.Router();

router.use((req, res, next) => {
  req.container.resolve("passport").passportInit(passport, next);
});

router.use(passport.initialize());

router.use(passport.session());

router.get("/healthCheck", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Dashboard API's

router.post("/register", (req, res) => {
  req.container.resolve("userRegisterApi").handleRequest(req, res);
});

router.post(
  "/login",
  passport.authenticate("userSession", { session: false }),
  (req, res) => {
    req.container.resolve("loginUserApi").handleRequest(req, res);
  }
);

router.post("/forgot-password", (req, res) => {
  req.container.resolve("forgotPasswordApi").handleRequest(req, res);
});

router.post("/reset-password", (req, res) => {
  req.container
    .resolve("forgotPasswordApi")
    .handleRequestResetPassword(req, res);
});

router.post(
  "/csv-upload",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  helpers.writerValidator,
  (req, res) => {
    req.container.resolve("csvUploadApi").handleRequest(req, res);
  }
);

router.post(
  "/csv-download",
  passport.authenticate("jwt", { session: false }),
  helpers.writerValidator,
  (req, res) => {
    req.container.resolve("csvDownloadApi").handleRequest(req, res);
  }
);

router.post(
  "/file-upload",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  helpers.writerValidator,
  (req, res) => {
    req.container.resolve("fileUploadApi").handleRequest(req, res);
  }
);

router.post(
  "/tablewise-list",
  passport.authenticate("jwt", { session: false }),
  helpers.viewerValidator,
  (req, res) => {
    req.container.resolve("listTableApi").handleRequest(req, res);
  }
);

router.post(
  "/tablewise-edit",
  passport.authenticate("jwt", { session: false }),
  helpers.writerValidator,
  (req, res) => {
    req.container.resolve("editDataTableApi").handleRequest(req, res);
  }
);

router.post(
  "/header-list",
  passport.authenticate("jwt", { session: false }),
  helpers.viewerValidator,
  (req, res) => {
    req.container.resolve("headerListApi").handleRequest(req, res);
  }
);

router.post(
  "/header-edit",
  passport.authenticate("jwt", { session: false }),
  helpers.adminValidator,
  (req, res) => {
    req.container.resolve("headerEditApi").handleRequest(req, res);
  }
);

router.post(
  "/tablewise-edit/review",
  passport.authenticate("jwt", { session: false }),
  helpers.adminValidator,
  (req, res) => {
    req.container.resolve("dataStatusUpdateApi").handleRequest(req, res);
  }
);

router.post(
  "/tablewise-count",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    req.container.resolve("tableWiseCountApi").handleRequest(req, res);
  }
);

router.get(
  "/user-role",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    req.container.resolve("userRoleApi").handleRequest(req, res);
  }
);

router.post(
  "/user-access-list",
  passport.authenticate("jwt", { session: false }),
  helpers.adminValidator,
  (req, res) => {
    req.container.resolve("userAccessListApi").handleRequest(req, res);
  }
);

router.post(
  "/edit-user-access",
  passport.authenticate("jwt", { session: false }),
  helpers.adminValidator,
  (req, res) => {
    req.container.resolve("editUserAccessApi").handleRequest(req, res);
  }
);

router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    req.container.resolve("logoutUserApi").handleRequest(req, res, next);
  }
);

module.exports = router;
