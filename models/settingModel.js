const mongoose = require("mongoose");
const {Schema} =  mongoose;

const settingSchema = Schema({
    companyName:{type:String,required:true},
    ar_companyName:{type:String,required:true},
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
    logo:{type:String},
    countryCode:{type:String,default:"SA"},
    identityType:{type:String,default:"CRN"},
    address:{type:String},
    notes:{type:String},
    salesIncludeTax:{type:Boolean,default:false},
    purchasesIncludeTax:{type:Boolean,default:false},
    taxRate:{type:Number,default:0}, // 0 or 15
},{timestamps:true});

module.exports = mongoose.model('setting',settingSchema,)