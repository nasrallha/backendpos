const mongoose = require("mongoose");
const {Schema} =  mongoose;

const unitSchema = Schema({
    name:{
        type:String,
        required:[true,'unit name is required field'],
        unique:true,
        trim:true
    },
    ar_name:{
        type:String,
        required:[true,'unit arbic name is required field'],
        unique:true,
        trim:true
    },
   status:{type:Boolean,default:false},
},{timestamps:true});

module.exports = mongoose.model('unit',unitSchema,)