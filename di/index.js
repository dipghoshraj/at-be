const { createContainer, asValue } = require("awilix");

const envConfig = require("../config");
const serverConfig = require("../config/server-config");

// Utils
const utils = require("../utils");

// API
const CsvUploadApi = require("../api/v1/csvUpload");
const CsvDownloadApi = require("../api/v1/csvDownload");
const HeaderListApi = require("../api/v1/headerList");
const HeaderEditApi = require("../api/v1/headerEdit");
const FileUploadApi = require("../api/v1/fileUpload");
const UserRegisterApi = require("../api/v1/userRegister");
const UserRoleApi = require("../api/v1/userRole");
const UserAccessListApi = require("../api/v1/userAccessList");
const LoginUserApi = require("../api/v1/loginUser");
const LogoutUserApi = require("../api/v1/logoutUser");
const ForgotPasswordApi = require("../api/v1/forgotPassword");
const ListTableApi = require("../api/v1/listTable");
const TableWiseCountApi = require("../api/v1/tablewiseCount");
const EditDataTableApi = require("../api/v1/editDataTable");
const EditUserAccessApi = require("../api/v1/editUserAccess");
const DataStatusUpdateApi = require("../api/v1/dataStatusUpdate");

//Repository
const dbPoolRepo = require("../repository/dbPool");

// Data Repo
const dataRepo = require("../repository/data");

// Extras
const extrasRepo = require("../repository/extras");

// Logic
const DataTableLogic = require("../logic/dataTableLogic");
const HeaderLogic = require("../logic/headerLogic");
const UserLogic = require("../logic/userLogic");
const ForgotPasswordLogic = require("../logic/forgotPasswordLogic");

const container = createContainer();

const utility = new utils.utility();
container.register({
  config: asValue(envConfig),
  serverConfig: asValue(serverConfig),
  constants: asValue(utils.constants),
  utility: asValue(utility),
});

// Repository
const dbPool = dbPoolRepo(container);
container.register("postgresDB", asValue(dbPool.postgresClient));
container.register("awsS3", asValue(dbPool.s3Client));

// Data Repo
const datas = dataRepo(container);
container.register("userData", asValue(datas.user));
container.register("hitOnGsheet", asValue(datas.hitOnGsheet));
container.register("externalApiRequest", asValue(datas.externalApiRequest));

// Extra Repo
const extras = extrasRepo(container);
container.register("passport", asValue(extras.passport));
container.register("sendGridMail", asValue(extras.sendGridMail));

// Logic
const dataTableLogic = new DataTableLogic(container);
container.register("dataTableLogic", asValue(dataTableLogic));

const headerLogic = new HeaderLogic(container);
container.register("headerLogic", asValue(headerLogic));

const userLogic = new UserLogic(container);
container.register("userLogic", asValue(userLogic));

const forgotPasswordLogic = new ForgotPasswordLogic(container);
container.register("forgotPasswordLogic", asValue(forgotPasswordLogic));

// API
const csvUploadApi = new CsvUploadApi(container);
container.register("csvUploadApi", asValue(csvUploadApi));

const csvDownloadApi = new CsvDownloadApi(container);
container.register("csvDownloadApi", asValue(csvDownloadApi));

const headerListApi = new HeaderListApi(container);
container.register("headerListApi", asValue(headerListApi));

const headerEditApi = new HeaderEditApi(container);
container.register("headerEditApi", asValue(headerEditApi));

const fileUploadApi = new FileUploadApi(container);
container.register("fileUploadApi", asValue(fileUploadApi));

const listTableApi = new ListTableApi(container);
container.register("listTableApi", asValue(listTableApi));

const editDataTableApi = new EditDataTableApi(container);
container.register("editDataTableApi", asValue(editDataTableApi));

const dataStatusUpdateApi = new DataStatusUpdateApi(container);
container.register("dataStatusUpdateApi", asValue(dataStatusUpdateApi));

const editUserAccessApi = new EditUserAccessApi(container);
container.register("editUserAccessApi", asValue(editUserAccessApi));

const userRegisterApi = new UserRegisterApi(container);
container.register("userRegisterApi", asValue(userRegisterApi));

const userRoleApi = new UserRoleApi(container);
container.register("userRoleApi", asValue(userRoleApi));

const userAccessListApi = new UserAccessListApi(container);
container.register("userAccessListApi", asValue(userAccessListApi));

const loginUserApi = new LoginUserApi(container);
container.register("loginUserApi", asValue(loginUserApi));

const logoutUserApi = new LogoutUserApi(container);
container.register("logoutUserApi", asValue(logoutUserApi));

const forgotPasswordApi = new ForgotPasswordApi(container);
container.register("forgotPasswordApi", asValue(forgotPasswordApi));

const tableWiseCountApi = new TableWiseCountApi(container);
container.register("tableWiseCountApi", asValue(tableWiseCountApi));

module.exports = container;
