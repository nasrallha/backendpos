const mongoose = require("mongoose");
const {Schema} =  mongoose;

const branchSchema = Schema({
    name:{
        type:String,
        required: [true, 'Name is required field!'],
        trim:true,
        unique:true
    },
    ar_name:{
        type:String,
        required: [true, 'Arbic name is required field!'],
        trim:true
    },
    location:{
        type:String,
        trim:true
    },
    code:{
        type:String,
        trim:true
    },
     status:{type:Boolean,default:false}
},{timestamps:true});

module.exports = mongoose.model('branch',branchSchema)
