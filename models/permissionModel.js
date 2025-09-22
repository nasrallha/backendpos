const mongoose = require("mongoose");
const {Schema} =  mongoose;

const permissionSchema = Schema({
    name:{
        type:String,
        required: [true, 'Name is required field!'],
        trim:true,
        unique:true
    },
     key:{
        type:String,
        required: [true, 'key  is required field!'],
        trim:true
    },
    ar_name:{
        type:String,
        required: [true, 'Arbic name is required field!'],
        trim:true
    },
    status:{type:Boolean,default:false},
},{timestamps:true});

module.exports = mongoose.model('Permission',permissionSchema,)