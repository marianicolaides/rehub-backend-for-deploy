const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  review: String,
  approve: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: String,
    default: 0,
  },
  flag: {
    type: Boolean,
    default: false,
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "space",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "booking",
  },
});

const Review = mongoose.model("review", reviewSchema);
module.exports.Review = Review;
