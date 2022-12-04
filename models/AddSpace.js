const mongoose = require("mongoose");
const AddSpaceSchema = new mongoose.Schema({
  name: String,
  price: Number,
  address: String,
  spaceImage: String,
  longitude:String,
  latitude:String,
  userImage: {
    default: null,
    type: String,
  },
  pickDate: {
    type: Array,
  },
  currentDate:String,
  // pickDate: [
  //   {
  //     dateofAvailibilty: {
  //       type: String,
  //     },

  //     timeslots: [
  //       // type: Array,
  //       {
  //         isTimeSelected: {
  //           type: Boolean,
  //           default: false,
  //         },
  //         isBooked: {
  //           type: Boolean,
  //           default: false,
  //         },
  //         timevalue: {
  //           type: String,
  //         },
  //       },
  //     ],
  //   },
  // ],

  therapisthub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "therapisthub",
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "therapist",
  },
});
const Space = mongoose.model("space", AddSpaceSchema);

module.exports.Space = Space;
