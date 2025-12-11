const mongoose = require("mongoose");
const QuotationSchema = new mongoose.Schema(
  {
    quotationNumber: {type:String},
    ISODATE:{type:String, required:[true,'isodate is required']},
    quotationDate: {
      type: String,
      required: [true, "date is required field!"],
    },
    ISODATE: { type: String, required: [true, "isodate is required"] },
    quotationTime: {
      type: String,
      required: [true, "time is required field!"],
    },
    year:{type:String},
    customer: {type: mongoose.Schema.Types.ObjectId, ref:"Customer"},
    isTaxIncluded: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        brandId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
          default: null,
        },
        unitId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "unit",
          default: null,
        },
        baseItem: { type: String },
        unitCount: { type: Number, default: 1 },
        serial: { type: String },
        name: { type: String },
        ar_name: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        unitCost: { type: Number, default: 0 },
        IncludeTax: { type: Boolean, default: false },
        taxRate: { type: Number, default: 0 },
        discountType: {
          type: String,
          enum: ["", "amount", "percent"],
          default: "percent",
        },
        discountValue: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        itemSubTotal: { type: Number, default: 0 },
        itemTax: { type: Number, default: 0 },
        itemTotal: { type: Number, default: 0 },
      },
    ],
    discountType: {
      type: String,
      enum: ["", "amount", "percent"],
      default: "percent",
    },
    discountValue: { type: Number, default: 0 },
    discountAfterTax: { type: Boolean, default: true },
    discountAmount: { type: Number, default: 0 },
    subTotalAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Quotation", QuotationSchema);
