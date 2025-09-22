const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = Schema(
  {
    code: {
      type: String,
      required: [true, "payment number is required field"],
    },
    type: {
      type: String,
      enum: ["Customer", "Supplier"],
      required: [true, "payment type is required field"],
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "type",
      required: [true, "customer or supplier is required field"],
    },
    amount: {
      type: Number,
      default: 0,
      required: [true, "voucher amount is required field"],
    },
    paymentDate: { type: String },
    paymentMethode: {
      type: String,
      required: [true, "payment method is required field"],
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
