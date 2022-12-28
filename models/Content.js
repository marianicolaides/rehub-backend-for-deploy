const mongoose = require("mongoose");

const contentSchema = mongoose.Schema({
  paragraph1: {
    type: String,
  },
  paragraph2: {
    type: String,
  },
  paragraph3: {
    type: String,
  },
  primaryColor: {
    type: String,
  },
  secondaryColor: {
    type: String,
  },
  picture1: {
    type: String,
  },

  picture2: {
    type: String,
  },

  picture3: {
    type: String,
  },
  platFormFee:{
    type:Number
  }
});

// module.exports = mongoose.model("content", contentSchema);
const content = mongoose.model("content", contentSchema);

module.exports.content = content;