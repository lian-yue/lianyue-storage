"use strict";
const log4js = require("log4js");
const path = require("path");
log4js.configure({
  appenders: [
    { type: "console" }, //控制台输出
    {
      type: "file",     //文件输出
      filename: path.join(__dirname, "../logs/storage/access.pid."+ process.pid +".log"),
      maxLogSize: 1024 * 1024 * 10,
      backups: 32,
      category: "normal"
    }
  ],
  // replaceConsole: true,
});

const logger = log4js.getLogger("normal");
logger.setLevel("DEBUG");

module.exports = {

  // 日志
  logger: logger,

  original: path.join(__dirname, '../storage/'),

  thumbnail: path.join(__dirname, '../thumbnails/'),

  filters: (width, height, crop, enlarge, extension) => {
    if (width && width < 50) {
      return false;
    }
    if (height && height < 50) {
      return false;
    }
    if (width && width > 2048) {
      return false;
    }
    if (height && height > 2048) {
      return false;
    }

    if (extension == 'gif') {
      if (crop || !width || !height) {
        return false;
      }
      if (width > 512 || height > 512) {
        return false;
      }
      if ((width * height) > (512 * 512)) {
        return false;
      }
    }
    return true;
  },
};
