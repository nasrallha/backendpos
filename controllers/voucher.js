const Voucher = require("../models/voucherModel.js");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");
const CustomError = require("../config/CustomError.js");
const { default: mongoose } = require("mongoose");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
dayjs.extend(quarterOfYear);

// get next voucher number
const getNextVoucherNumber = async (req, res, next) => {
  try {
    const lastVoucher = await Voucher.findOne({})
      .sort({ voucherNumber: -1 })
      .limit(1);
    if (lastVoucher !== null) {
      const nextVoucherNumber = parseInt(lastVoucher.voucherNumber) + 1;
      return res.status(200).json({ voucherNumber: nextVoucherNumber });
    } else {
      return res.status(200).json({ voucherNumber: 1 });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//add new voucher
const addNewVoucher = asyncErorrHandeler(async (req, res, next) => {
  const {
    voucherNumber,
    type,
    name,
    amount,
    voucherDate,
    paymentMethode,
    notes,
  } = req.body;
  try {
    const exsistVoucher = await Voucher.findOne({ voucherNumber }).exec();
    //check if voucherNumver is exsist
    if (exsistVoucher) {
      return next(new CustomError("This voucher is already exsist", 400));
    }
    // create voucher
    const newVoucher = await Voucher.create({
      voucherNumber,
      type,
      name,
      amount,
      voucherDate,
      paymentMethode,
      notes,
    });
    if (newVoucher !== null) {
      const _newVoucher = await Voucher.findOne({ _id: newVoucher._id }).exec();
      return res.status(201).json({ voucher: _newVoucher });
    } else {
      return next(
        new CustomError("This voucher don't created this is some error", 400)
      );
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
// update voucher
const updateVoucher = async (req, res, next) => {
  const { id } = req.params;
  try {
    //find voucher
    const updatedVoucher = await Voucher.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    return res.status(200).json({ voucher: updatedVoucher });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//delete one voucher
const deleteOneVoucher = async (req, res, next) => {
  try {
    const deletedVoucher = await Voucher.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    if (deletedVoucher) {
      return res.status(200).json({ id: deletedVoucher._id });
    } else {
      return next(new CustomError("This voucher is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//delete many voucher
const deleteManyVoucher = async (req, res, next) => {
  const { voucherIds } = req.body;
  let deletedVouchers = [];
  try {
    if (voucherIds.length === 0) {
      return next(new CustomError("No voucher Selected", 400));
    } else {
      for (let i = 0; i < voucherIds.length; i++) {
        const voucherId = voucherIds[i];
        const deletedRole = await Voucher.findOneAndDelete({
          _id: voucherId,
        }).exec();
        if (!deletedRole) {
          return next(new CustomError(`This ${voucherId} is not exsist`, 400));
        }
        deletedVouchers = [...deletedVouchers, deletedRole];
      }
      if (voucherIds.length === deletedVouchers.length) {
        return res
          .status(200)
          .json({ msg: "Voucher successful deleted", ids: voucherIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
const fetchOneVoucher = async (req, res) => {
  try {
    const { partyId } = req.query;

    // check query
    if (!partyId) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one filter",
      });
    }

    // check query is not empty
    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one valid filter",
      });
    }

    const voucher = await Voucher.aggregate([
      { $match: { partyId: new mongoose.Types.ObjectId(partyId) } },

      // supplier lookup
      {
        $lookup: {
          from: "suppliers",
          localField: "partyId",
          foreignField: "_id",
          as: "supplierData",
        },
      },
      // customer lookup
      {
        $lookup: {
          from: "customers",
          localField: "partyId",
          foreignField: "_id",
          as: "customerData",
        },
      },
      // user lookup
      {
        $lookup: {
          from: "users",
          localField: "partyId",
          foreignField: "_id",
          as: "userData",
        },
      },

      // merge into one field
      {
        $addFields: {
          partyData: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$partyType", "supplier"] },
                  then: "$supplierData",
                },
                {
                  case: { $eq: ["$partyType", "customer"] },
                  then: "$customerData",
                },
                { case: { $eq: ["$partyType", "user"] }, then: "$userData" },
              ],
              default: [],
            },
          },
        },
      },

      // remove temp fields
      {
        $project: {
          supplierData: 0,
          customerData: 0,
          userData: 0,
        },
      },
    ]);

    if (voucher.length > 0) {
      return res.status(200).json({ voucher });
    } else {
      return res.status(400).json({ msg: "No  voucher found by this party" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// fetch all vouchers
const fetchVouchers = async (req, res) => {
  try {
    // const {
    //   year,
    //   month,
    //   quarter,
    //   startDate,
    //   endDate,
    // } = req.query;

    // // check query
    // if (
    //   !year &&
    //   !month &&
    //   !quarter &&
    //   !startDate &&
    //   !endDate
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: "Please select at least one filter",
    //   });
    // }

    // let query = {};

    // // 2- search by month
    // if (year && month) {
    //   const start = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
    //     .startOf("month")
    //     .format("YYYY/MM/DD");

    //   const end = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
    //     .endOf("month")
    //     .format("YYYY/MM/DD");

    //   query.voucherDate = { $gte: start, $lte: end };
    // }

    // // 3- search by quarter
    // if (year && quarter) {
    //   const start = dayjs()
    //     .year(Number(year))
    //     .quarter(Number(quarter))
    //     .startOf("quarter");
    //   const end = dayjs()
    //     .year(Number(year))
    //     .quarter(Number(quarter))
    //     .endOf("quarter");

    //   query.voucherDate = {
    //     $gte: start.format("YYYY/MM/DD"),
    //     $lte: end.format("YYYY/MM/DD"),
    //   };
    // }

    // // 4- search by range date
    // if (startDate && endDate) {
    //   const s = dayjs(startDate, "YYYY/MM/DD").format("YYYY/MM/DD");
    //   const e = dayjs(endDate, "YYYY/MM/DD").format("YYYY/MM/DD");
    //   query.voucherDate = { $gte: s, $lte: e };
    // }

    // // check query is not empty
    // if (Object.keys(query).length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: "Please select at least one valid filter",
    //   });
    // }

    const vouchers = await Voucher.find({}).exec();
    if (vouchers.length > 0) {
      return res.status(200).json({ vouchers });
    } else {
      return res.status(400).json({ msg: "No vouchers found by this filter" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addNewVoucher,
  updateVoucher,
  deleteOneVoucher,
  deleteManyVoucher,
  fetchVouchers,
  fetchOneVoucher,
  getNextVoucherNumber,
};
