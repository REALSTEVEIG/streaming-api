require("dotenv").config();
// const userMigration = require("./usersMigration");

const db = require("../config/config");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const runMigration = async () => {
  try {
    fs.readdirSync(__dirname)
      .filter((file) => {
        return (
          file.indexOf(".") !== 0 &&
          file !== basename &&
          file.slice(-3) === ".js"
        );
      })
      .forEach(async (file) => {
        const service = require(path.join(__dirname, file));
        await service(db);
      });
  } catch (e) {
    console.log(e);
  } finally {
    console.log("Collections created and connection closed!");
  }
};
runMigration().catch(console.error);
// module.exports = runMigration;
