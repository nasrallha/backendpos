const mongoose = require("mongoose");
const {Schema} =  mongoose;

const categorySchema = Schema({
    name:{type:String,required:true},
    ar_name:{type:String,required:true},
    parentId:{type:String,default:""},
    // type:{type:String,required:true},
    image:{type:String},
    status:{type:Boolean,default:false},
},{timestamps:true});

module.exports = mongoose.model('Category',categorySchema,)