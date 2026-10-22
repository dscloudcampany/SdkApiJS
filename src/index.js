const { DsCloudAPI, DsCloudAPIKEY } = require("./client");
const { Application } = require("./structures/Application");
const { DsCloudAPIError } = require("./errors");
const { UsersManager } = require("./managers/UsersManager");
const { AppsManager } = require("./managers/AppsManager");
const { DatabasesManager } = require("./managers/DatabasesManager");

module.exports = {
  DsCloudAPI,
  DsCloudAPIKEY,
  Application,
  DsCloudAPIError,
  UsersManager,
  AppsManager,
  DatabasesManager
};

// Export padrão para suportar require("@dscloud/sdkapi") diretamente
module.exports.default = DsCloudAPI;
