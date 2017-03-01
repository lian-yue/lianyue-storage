"use strict";
const path = require("path");

module.exports = {

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
