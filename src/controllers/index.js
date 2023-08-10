const fs = require("fs");
const path = require("path");
const awilix = require("awilix");
const basename = path.basename(__filename);

module.exports = () => {
  let controllers = {};
  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
      );
    })
    .forEach((file) => {
      const controller = require(path.join(__dirname, file));
      const name = file.split(".")[0];
      controllers[`${name.charAt(0).toLowerCase() + name.slice(1)}`] =
        awilix.asClass(controller);
    });
  return controllers;
};
