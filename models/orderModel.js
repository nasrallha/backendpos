const mongoose = require("mongoose");
const {Schema} =  mongoose;

const orderSchema = Schema({
    customer:{type:mongoose.Schema.Types.ObjectId, ref:"Customer",required:[true,"customer is required!"]},
    invNo:{type:Number,required:[true,"Invoice number is required!"]},
    orderDate:{type:String},
    orderTime:{type:String,default:new Date().toLocaleTimeString()},
    isOrder:{type:Boolean,default:true},
    priceIncludeTax:{type:Boolean,default:false},
    taxValue:{type:Number},
    isDiscount:{type:Boolean,default:false},
    discountType:{type:Number, default:0} , // 0=> no discount 1 => is discount percent  2 => is discont amount
    discountValue:{type:Number,default:0},
    paid1:{type:Number, required:[true,"order paid1 is required!"]},
    paid2:{type:Number,default:0},
    paid:{type:Number,required:[true,"order paid is required!"]},
    remaining:{type:Number,default:0},
    paymentMethod1:{type:Number,required:[true,"order paymentMethod1 is required!"]},
    paymentMethod2:{type:Number,default:0},
    saleInvNo:{type:Number,defaulte:0},
    status:{
        type:String,
        enum : ['paid','unpaid','partially paid','returned'],
        default: 'paid'
    },
    items:[
        {
            productId:{type:mongoose.Schema.Types.ObjectId, ref:"Product"},
            categoryId:{type:mongoose.Schema.Types.ObjectId, ref:"Category"},
            // unitId:{type:mongoose.Schema.Types.ObjectId, ref:"unit"},
            serial:{type:String},
            price:{type:Number},
            quantity:{type:Number,default:1},
            discount:{type:Number,default:0},
        }
    ],
    seller:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    orderAmount:{type:Number},
},{timestamps:true});

module.exports = mongoose.model('Order',orderSchema,)