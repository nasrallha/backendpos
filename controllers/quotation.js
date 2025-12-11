const mongoose = require("mongoose");
const Quotation = require("../models/quotationModel.js");
const CustomError = require("../config/CustomError.js");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
dayjs.extend(quarterOfYear);

// get sale next quotation number
const getNextQuotationNumber = async (req, res) => {
  const lastQuotation = await Quotation.findOne({})
    .sort({ createdAt: -1 })
    .lean();
  let newNumber = 1;
  let quotationNumber = 1;
  if (lastQuotation && lastQuotation.quotationNumber) {
    const lastNumPart = parseInt(lastQuotation.quotationNumber);
    newNumber = lastNumPart + 1;
    quotationNumber = newNumber;
  } else {
    quotationNumber = 1;
  }

  return res.status(200).json({ quotationNumber });
};
//add new quotation 
const createNewQuotation = async (req, res, next) => {
  const {
    quotationDate,
    quotationTime,
    customer,
    year,
    quotationNumber,
    isTaxIncluded,
    taxRate,
    items,
    discountType,
    discountValue,
    discountAfterTax,
    discountAmount,
    subTotalAmount,
    totalAmount,
    taxAmount,
    netAmount,
  } = req.body;
  
  try {
    const exsisOuotation = await Quotation.findOne({ quotationNumber }).exec();
    if (exsisOuotation) {
      return next(new CustomError("This quotation is already exist", 400));
    }
    // create new quotation
    const newQuotation = await Quotation.create({
      ISODATE:dayjs().format(),
      quotationDate,
      quotationTime,
      quotationNumber,
      customer,
      isTaxIncluded,
      taxRate,
      year,
      items,
      discountType,
      discountValue,
      discountAfterTax,
      discountAmount,
      subTotalAmount,
      totalAmount,
      taxAmount,
      netAmount,
      createdBy: req.user.id,
    });

    if (newQuotation) {
      const _newQuotation = await Quotation.findOne({_id:newQuotation._id}).populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" }).exec();
      return res.status(201).json({ quotation: _newQuotation });
    } else {
      return next(new CustomError("Something went wrong!", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//update quotation
const updateQuotation = async(req,res,next)=>{
  try {
    const {id} = req.params;
    const updatedQuotation = await Quotation.findByIdAndUpdate({_id:id},req.body,{ new: true, upsert: true })
    .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" }).exec();
      return res.status(200).json({ quotation: updatedQuotation });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//delete quotation
const deleteQuotation = async(req,res,next)=>{
  try {
    const {id} = req.params;
    const deleteQuotation = await Quotation.findByIdAndDelete({_id:id});
      return res.status(200).json({ id: deleteQuotation._id });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
}
// get quotation quotation number
const getQuotation = async (req, res, next) => {
  try {
    const {number} = req.query;
    if (!number) {
      return next(
        new CustomError("quotion number are required", 400)
      );
    }
    const result = await Quotation.findOne({quotationNumber:number})
      .populate({ path: "createdBy", select: "_id name" }).populate({ path: "customer" }).exec();
    if (result) {
      return res.status(200).json({ quotation: result });
    } else {
      return res
        .status(404)
        .json({ msg: "There is no quotation for this number." });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// get quotation
const getQuotations = async (req, res) => {
  try {
    const {
      number,
      month,
      year,
      quarter,
      startDate,
      endDate,
      customer,
    } = req.query;
    // check query
    // if (
    //   !number &&
    //   !month &&
    //   !quarter &&
    //   !startDate &&
    //   !endDate,
    //   !customer
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: "Please select at least one filter",
    //   });
    // }

    let query = {};
    // 1- search by quotation number
    if (number) {
      query.quotationNumber = number
    }
    if(customer){
      query.customer = new mongoose.Types.ObjectId(customer)
    }
    // 4- search by month
    if (year && month) {
      const start = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .startOf("month")
        .format("YYYY/MM/DD");

      const end = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .endOf("month")
        .format("YYYY/MM/DD");

      query.quotationDate = { $gte: start, $lte: end };
    }

    // 5- search by quarter
    if (year && quarter) {
      const start = dayjs()
        .year(Number(year))
        .quarter(Number(quarter))
        .startOf("quarter");
      const end = dayjs()
        .year(Number(year))
        .quarter(Number(quarter))
        .endOf("quarter");

      query.quotationDate = {
        $gte: start.format("YYYY/MM/DD"),
        $lte: end.format("YYYY/MM/DD"),
      };
    }

    // 6- search by range date
    if (startDate && endDate) {
      const s = dayjs(startDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      const e = dayjs(endDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      query.quotationDate = { $gte: s, $lte: e };
    }
    //check query is not empty
    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one valid filter",
      });
    }

    const quotations = await Quotation.find(query)
      .populate({ path: "createdBy", select: "_id name" }).populate({ path: "customer" }).exec();
    if (quotations.length > 0) {
      return res.status(200).json({ count: quotations.length, quotations });
    } else {
      return res
        .status(400)
        .json({ msg: "No quotations founded with filter"});
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getNextQuotationNumber,
  createNewQuotation,
  getQuotation,
  getQuotations,
  updateQuotation,
  deleteQuotation
};
