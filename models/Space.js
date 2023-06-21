const mongoose = require("mongoose");
const SpaceSchema = new mongoose.Schema({
  name: String,
  price: Number,
  address: String,
  spaceImage: String,
  longitude:String,
  latitude:String,
  isActive: {
    default: true,
    type: Boolean,
  },
  detailedInformation: {
    default: "",
    type: String,
  },
  userImage: {
    default: null,
    type: String,
  },
  pickDate: {
    type: Array,
  },
  currentDate:String,
  scheduleTimeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "scheduleTimeSlot",
  },
  therapisthub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "therapisthub",
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "therapist",
  },
});
const Space = mongoose.model("space", SpaceSchema);

module.exports.Space = Space;
