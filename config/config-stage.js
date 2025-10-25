module.exports = {
  activeEnv: "STAGING",
  postgres: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  awsS3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  gSheetURL: `https://script.google.com/macros/s/${process.env.GOOGLE_SHEET_ID}/exec`,
};
