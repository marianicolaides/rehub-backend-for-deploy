const mongoose = require("mongoose");
const therapistHubSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    location: String,
    information: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const TherapistHub = mongoose.model("therapisthub", therapistHubSchema);

module.exports.TherapistHub = TherapistHub;
