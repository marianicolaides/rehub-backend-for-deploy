const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    bookingDate: String,
    bookingTime: String,
    userName: String,
    userData: Object,
    bookingStatus: String,
    spaceName: String,
    spacePrice: Number,
    bookingInvoiceNumber: String,
    paymentStatus: {
      default: "Paid",
      type: String,
    },
    reviewSubmit: {
      default: false,
      type: Boolean,
    },
    spaceImage: String,
    // userId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "therapist",
    },

    status: {
      type: String,
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "space",
    },
    spaceUserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },

  {
    timestamps: true,
  }
);

const Booking = mongoose.model("booking", bookingSchema);

module.exports.Booking = Booking;
