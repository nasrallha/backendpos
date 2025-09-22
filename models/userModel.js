const mongoose = require('mongoose');
const {Schema} = mongoose;
const userSchema = Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,
        enum : ['cashier','admin','supper admin' ,'menger','delegate' ],
        default: 'cashier'},
    avatar:{type:String},
    status:{type:Boolean,default:true},
},{timestamps:true});

module.exports = mongoose.model('User',userSchema);
