const Discount = require("../models/discountModel.js");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");
const CustomError = require("../config/CustomError.js");
const { formatCurrentDate } = require("../middleware/helperMiddleware.js");

const checkDiscountIsExpired = (discount)=>{
  const now = formatCurrentDate(new Date());
  if( now > discount.startDate && now > discount.endDate){
    return true
  }else{
    return false
  }
}
//add new discount
const addNeDiscount = asyncErorrHandeler(async (req, res,next) => {
  const { name, discountType, value, type,items,startDate,endDate,active, createdDate, createdTime } = req.body;
  try {
    // create new discount
    const newDiscount = await Discount.create({
      name,
      discountType,
      value,
      appliesTo:{
        type,
        items
      },
      startDate,
      endDate,
      active,
      createdDate,
      createdTime
    });
    if (newDiscount !== null) {
      const _newDiscount = await Discount.findOne({ _id: newDiscount._id }).exec();
        return res.status(201).json({ discount: _newDiscount });
    } else {
      return next(new CustomError("This discount don't created this is some error",400));
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
});
// update discount
const updatDiscount = async (req, res,next) => {
  const { id } = req.params;
  const uPppliesTo={
    type:req.body.type,
    items:req.body.items
  };
  req.appliesTo = uPppliesTo;
  try {
      const updatedDiscount = await Discount.findOneAndUpdate({ _id: id }, req.body, { new: true, upsert: true ,runValidators:true});
      return res.status(200).json({ discount: updatedDiscount });
    
  } catch (error) {
    return next(new CustomError(error.message,400));
  } 
};
//delete one discount
const deleteOneDiscount = async (req, res,next) => {
  try {
    const deletedDiscount = await Discount.findOneAndDelete({_id:req.params.id}).exec();
    if(deletedDiscount){
      return res.status(200).json({id:deletedDiscount._id});
    }else{
      return next(new CustomError("This discount  is not exsist",400));
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
//delete many discount
const deleteManyDiscount= async (req, res,next) => {
  const { discountsIds } = req.body;
  let deletedDiscounts = [];
  try {
    if (discountsIds.length === 0) {
      return next(new CustomError("No discount Selected",400));
    }else{
      for (let i = 0; i < discountsIds.length; i++) {
        const discountId = discountsIds[i];
        const deletedDiscount = await Discount.findOneAndDelete({_id: discountId,}).exec();
        if (!deletedDiscount) {
            return next(new CustomError(`This ${discountId} is not exsist`,400));
        }
        deletedDiscounts = [...deletedDiscounts, deletedDiscount];
      }
      if (discountsIds.length === deletedDiscounts.length) {
        return res.status(200).json({ msg: "discounts successfuly deleted", ids: discountsIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
// fetch all discounts
const fetchDiscounts= async (req, res,next) => {
  const discounts = [];
  try {
    const tempDiscounts = await Discount.find().sort([["createdDate",1]]).exec();
    if (tempDiscounts.length > 0) {
      for (const discount of tempDiscounts) {
        if(checkDiscountIsExpired(discount)){
          // update active by false
          const upDiscount = await Discount.findOneAndUpdate({ _id: discount._id }, {
            $set:{
              active:false
            }
          }, { new: true, upsert: true ,runValidators:true});
          discounts.push(upDiscount)
        }else{
          discounts.push(discount)
        }
      }
      return res.status(200).json({discounts});
    } else {
      return res.status(404).json({ discounts: [], msg: "No discounts founded" });
    }
    
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};




module.exports = {
  addNeDiscount,
  updatDiscount,
  deleteOneDiscount,
  deleteManyDiscount,
  fetchDiscounts
};
