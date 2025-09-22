const mongoose = require("mongoose");
const {Schema} =  mongoose;

const userPermissionsSchema = Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    permissions:[],
},{timestamps:true});

module.exports = mongoose.model('userPermission',userPermissionsSchema,)