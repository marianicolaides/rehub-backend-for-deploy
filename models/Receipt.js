const mongoose = require("mongoose");
const receiptSchema = new mongoose.Schema(
  {
    invoiceNumber: String,
    paymentStatus: {
      default: "Paid",
      type: String,
    },
    // userId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "therapist",
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "space",
    },
    spaceRental: Number,
    rehubFee: Number,
    VATonPlatformFee: Number,
  },

  {
    timestamps: true,
  }
);

const Receipt = mongoose.model("receipt", receiptSchema);

module.exports.Receipt = Receipt;
