const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const therapistHubSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    location: String,
    information: String,
    image:String,
    password: String,
    usertype: String,
    userName:String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

therapistHubSchema.pre(['findOneAndUpdate'], async function (next) {
  ["email", "password"].forEach((key) => {
    if (!this._update[key]) {
      delete this._update[key];
    }
  });
  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 10);
  }

  next();
});

const TherapistHub = mongoose.model("therapisthub", therapistHubSchema);

module.exports.TherapistHub = TherapistHub;