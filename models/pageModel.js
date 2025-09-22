const mongoose = require("mongoose");
const {Schema} =  mongoose;

const pageSchema = Schema({
    name:{
        type:String,
        required:[true,'Pgae name is required feild']
    },
    ar_name:{
        type:String,
        required:[true,'Pgae arbic name is required feild']
    },
    parentId:{type:String,default:""},
    arrangement:{
        type:Number,
        required:[true,'Pgae arrangement is required feild']
    },
    navberPage:{type:Boolean,default:true},
    createdDate:{type:String},
    createdTime:{type:String,default:new Date().toLocaleTimeString()},
},{timestamps:true});

module.exports = mongoose.model('page',pageSchema,)