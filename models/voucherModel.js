const mongoose = require("mongoose");
const { Schema } = mongoose;

const voucherSchema = Schema(
  {
    voucherNumber: {
      type: String,
      required: [true, "voucher number is required feild"],
    },
    type: {
      type: String,
      enum: ["payment", "receipt"],
      required: [true, "voucher type is required feild"],
    },
    name: {
      type: String,
      required: [true, "name  is required feild"],
    },
    amount: {
      type: Number,
      default: 0,
      required: [true, "voucher amount is required feild"],
    },
    voucherDate: { type: String },
    paymentMethode: {
      type: String,
      required: [true, "payment methode is required feild"],
    },
    nots: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("voucher", voucherSchema);
