const fs = require("fs");

const confirmPath = (path) => {
  if (!fs.existsSync(path)) {
    try {
      fs.mkdirSync(path, { recursive: true });
    } catch (e) {
      throw new Error(e);
    }
  }
};

module.exports = {
  confirmPath
};
