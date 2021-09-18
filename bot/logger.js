const fs = require("fs");

const logStream = fs.createWriteStream("/logs/bot.log", { flags:"a" });
const log = {};

log.info = function (msg) {
  const message = JSON.stringify({
    name: "bot",
    level: "info",
    timestamp: new Date().getTime(),
    message: msg,
  });
  console.log(message);
  logStream.write(message + "\n");
};

log.debug = function (msg) {
  const message = JSON.stringify({
    name: "bot",
    level: "debug",
    timestamp: new Date().getTime(),
    message: msg,
  });
  console.log(message);
  logStream.write(message + "\n");
};

log.error = function (msg) {
  const message = JSON.stringify({
    name: "bot",
    level: "error",
    timestamp: new Date().getTime(),
    message: msg,
  });
  console.log(message);
  logStream.write(message + "\n");
};

module.exports = log;