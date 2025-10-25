const _ = require("lodash");
class UserLogic {
  constructor(container) {
    this.utility = container.resolve("utility");
    this.postgresDB = container.resolve("postgresDB");
    this.constants = container.resolve("constants");
    this.table = "dashboardusers";
    this.accessTabsTable = "usertabaccess";
    this.getUserRole = this.getUserRole.bind(this);
    this.getUserAccess = this.getUserAccess.bind(this);
  }

  async setUserRecordDb(userData) {
    const query = `INSERT INTO ${this.table} (profile_pic, fullname, email, phone, user_role, user_password, referrer_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const hashedPassword = await this.utility.maskInput(userData.password);
    const params = [
      userData.profilePic,
      userData.fullName,
      userData.email,
      userData.phone,
      "user",
      hashedPassword,
      null,
    ];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async setDefaultUserAccessToTabs(userId) {
    if (!userId) return Promise.reject(null);

    const columnsList =
      this.constants?.table?.[this.accessTabsTable]?.columns || [];
    const columns = ["userid", ...columnsList].join(", ");
    const columnsRefs = ["userid", ...columnsList]
      .map((_, i) => `$${i + 1}`)
      .join(", ");
    const query = `INSERT INTO ${this.accessTabsTable} (${columns}) 
      VALUES (${columnsRefs})`;

    const params = [userId, ...Array(columnsList.length).fill("null")];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async updateUserRecordDb(userId, keys = [], values = []) {
    if (!keys.length && !values.length) return Promise.reject(null);

    const columns = keys.map((key, i) => key + `=$${i + 1}`).join(", ");
    const query = `UPDATE ${this.table} SET ${columns}
        WHERE id = ${userId}
        RETURNING *`;
    const params = values;
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async updateUserAccessDb(accessId, keys = [], values = []) {
    if (!keys.length && !values.length) return Promise.reject(null);

    const columns = keys.map((key, i) => key + `=$${i + 1}`).join(", ");
    const query = `UPDATE ${this.accessTabsTable} SET ${columns}
        WHERE id = ${accessId}
        RETURNING *`;
    const params = values;
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async getUserAccess(userId) {
    if (!userId) return Promise.reject(null);
    const query = `SELECT * FROM ${this.accessTabsTable} WHERE userid = ${userId}`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async getUserAccessWithUserDetails(userId) {
    const query = `SELECT du.profile_pic, du.fullname, uta.fieldvisits, uta.id AS access_id, uta.projectRescue, uta.projectGobiShelter, uta.projectAdmittedToOtherHomes, uta.projectRehabilitationHomeClients, uta.projectRehabilitationHomeActivityTracker, uta.projectRehabilitationHomeFoodMenu, uta.projectRehabilitationHomeVisitors, uta.projectECRC, uta.project5A, uta.projectAwarenessProgram, uta.projectHumanitarianServices, uta.outPatientServices, uta.profilesClients, uta.profilesVolunteers, uta.profilesInformers, uta.profilesOtherHomes, uta.profilesStaffs, uta.programTimelines, uta.enquiries, uta.reports 
    FROM ${this.table} du JOIN ${this.accessTabsTable} uta ON du.id = uta.userid WHERE du.id <> ${userId}`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async getUserRole(userId) {
    if (!userId) return Promise.reject(null);
    const query = `SELECT user_role FROM ${this.table} WHERE id = ${userId}`;
    const params = [];
    return Promise.resolve(this.postgresDB.executeQuery(query, params));
  }

  async handleUserRegister(isNewUser, userData) {
    if (!isNewUser) {
      return Promise.reject(null);
    }
    const [err, insertRes] = await this.utility.invoker(
      this.setUserRecordDb(userData)
    );
    if (err) return Promise.reject(err);

    const userId = _.get(
      _.get(_.get(insertRes, "rows", []), "0", {}),
      "id",
      null
    );
    const [insertAccessErr, insertAccessRes] = await this.utility.invoker(
      this.setDefaultUserAccessToTabs(userId)
    );
    if (insertAccessErr) return Promise.reject(insertAccessErr);
    return Promise.resolve(!!insertRes.rowCount);
  }

  async handleUserRole(userId) {
    const [errUserRole, userRoleRes] = await this.utility.invoker(
      this.getUserRole(userId)
    );
    if (errUserRole) {
      return Promise.reject(errUserRole);
    }
    const userRole = _.get(_.get(userRoleRes, "rows", []), "0", {});
    return Promise.resolve(userRole?.user_role);
  }

  async handleUserAccessList(userId) {
    const [errUserAccess, userAccessRes] = await this.utility.invoker(
      this.getUserAccessWithUserDetails(userId)
    );
    if (errUserAccess) {
      return Promise.reject(errUserAccess);
    }
    const userAccessList = _.get(userAccessRes, "rows", []);
    return Promise.resolve(userAccessList);
  }

  async handleUserAccessEdit(editAcessPayload) {
    const { accessId, updatedData = {} } = editAcessPayload;
    const keys = _.keys(updatedData);
    const values = _.values(updatedData);

    const [errUserAccess, userAccessRes] = await this.utility.invoker(
      this.updateUserAccessDb(accessId, keys, values)
    );

    if (errUserAccess) {
      return Promise.reject(errUserAccess);
    }

    const userAccessList = _.get(_.get(userAccessRes, "rows", []), "0", {});
    return Promise.resolve(userAccessList);
  }
}

module.exports = UserLogic;
