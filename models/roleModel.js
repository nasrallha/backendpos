const mongoose = require("mongoose");
const {Schema} =  mongoose;

const roleSchema = Schema({
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
     status:{type:Boolean,default:false},
},{timestamps:true});

module.exports = mongoose.model('Role',roleSchema,)