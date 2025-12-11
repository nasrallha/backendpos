const mongoose = require("mongoose");
const { Schema } = mongoose;
const employeeSchema = Schema(
  {
    code: { type: String, default: 1 },
    name: { type: String, required: true },
    ar_name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    salary: { type: Number, default: 1500 },
    address: { type: String },
    ar_address: { type: String },
    image: { type: String },
    transactions: [
      {
        transactionCode:{type:String},
        type: {
          type: String,
          enum: ["advance", "deduction", "bonus"],
          default: "advance",
        },
        amount: { type: Number },
        date: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },
      },
    ],
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
