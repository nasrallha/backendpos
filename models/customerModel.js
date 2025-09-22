const mongoose = require("mongoose");
const {Schema} =  mongoose;

const customerSchema = Schema({
    code:{type:String,default:1},
    name:{type:String,required:true},
    email:{type:String},
    phone:{type:String},
    bankAccount:{type:String},
    country:{type:String},
    city:{type:String},
    district:{type:String},
    street:{type:String},
    buildingNo:{type:String},
    secondaryNo:{type:String},
    postalCode:{type:String},
    vatNumber:{type:String},
    commercialNo:{type:String},
    credit:{type:Number,default:0},
    debit:{type:Number,default:0},
    image:{type:String},
    status:{type:Boolean,default:true},
},{timestamps:true});

module.exports = mongoose.model('Customer',customerSchema,)