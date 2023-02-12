const mongoose = require("mongoose");
const therapistSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    location: String,
    information: String,
    password: String,
    usertype: String,


    image:String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const Therapist = mongoose.model("therapist", therapistSchema);

module.exports.Therapist = Therapist;