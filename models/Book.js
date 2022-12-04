const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    bookingDate: String,
    bookingTime: String,
    userName: String,
    bookingStatus: String,
    spaceName: String,
    spacePrice: Number,
    bookingInvoiceNumber: String,
    reviewSubmit: {
      default: false,
      type: Boolean,
    },
    spaceImage: String,
    userId: String,

    status: {
      type: String,
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddSpace",
    },
  },

  {
    timestamps: true,
  }
);

const Booking = mongoose.model("booking", bookingSchema);

module.exports.Booking = Booking;
