const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema(
  {
    barcode: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    ar_name: { type: String, required: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default:null},
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    baseUnit: { type: mongoose.Schema.Types.ObjectId, ref: "unit",default:null },
    price:{type:Number,default:0},
    cost:{type:Number,default:0},
    wholesalePrice:{type:Number,default:0},
    taxRate: { type: Number, default: 0},
    priceIncludeTax:{type:Boolean,default:false},
    costIncludeTax:{type:Boolean,default:false},
    status:{type:Boolean,default:false},
    productImages: [{ image: { type: String } }],
    colors:[],
    clothingSize:[],
    shoeSize:[],
    description:{type:String},
    ar_description:{type:String},
    unitCount:{type:Number,default:1},
    baseItem: { type: String },
    limit:{type:Number,default:0},
    startStock:{type:Number,default:0},
    stock: { type: Number, default: 0},
    createdDate: { type: String, required: true },
    createdTime: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", productSchema);
