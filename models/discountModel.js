const mongoose = require("mongoose");
const {Schema} =  mongoose;

const discountSchema = Schema({
    name:{
        type:String,
        required: [true, 'Name is required field!'],
        trim:true,
    },
    discountType:{type:String,
        enum : ['percentage','amount'],
        default: 'percentage'
    },
    value:{type:Number,required: [true, 'discount value is required field!']},
    startDate:{type:String},
    endDate:{type:String},
    appliesTo:{
        type : {type:String,  enum : ['category','product','invoice']},
        items:[]
    },
    active: {type:Boolean,default:false},
    createdDate:{type:String},
    createdTime:{type:String},
},{timestamps:true});

module.exports = mongoose.model('discount',discountSchema,)
