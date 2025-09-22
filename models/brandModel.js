const mongoose = require("mongoose");
const {Schema} =  mongoose;

const brandSchema = Schema({
    name:{
            type:String,
            // required:[true ,'brand name is required'],
            trim:true
        },
    ar_name:{
        type:String,
        // required:[true ,'brand name is required'],
        trim:true
    },
    image:{type:String},
   status:{type:Boolean,default:false},
},{timestamps:true});

module.exports = mongoose.model('Brand',brandSchema,)