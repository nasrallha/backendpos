const mongoose = require("mongoose");
const Sales = require("../models/salesModel.js");
const Purchases = require("../models/purchasesModel.js");
const Payment = require("../models/paymentsModel.js");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
dayjs.extend(quarterOfYear);

const recalcInvoicesForParty = async (type, partyId) => {
  const Model = type === "Customer" ? Sales : Purchases;
  //get invoices
  let invoices = await Model.find({
    [type === "Customer" ? "customer" : "supplier"]:
      new mongoose.Types.ObjectId(partyId),
  }).sort({ saleDate: 1, createdAt: 1 });
  // payments
  let payments = await Payment.find({ partyId }).sort({
    paymentDate: 1,
    createdAt: 1,
  });
// destrbute payments
  for (let invoice of invoices) {
    invoice.payments = 0;
    invoice.status = "unpaid";
    await invoice.save();
  }
  let paymentQueue = payments.map((p) => ({
    ...p.toObject(),
    remaining: p.amount,
  }));

  for (let invoice of invoices) {
    let remainingInvoice =
      invoice.netAmount - (invoice.paidAmount + invoice.payments);
    let simulatedPaid = 0;

    for (let payment of paymentQueue) {
      if (payment.remaining <= 0) continue;

      let toPay = Math.min(payment.remaining, remainingInvoice);
      simulatedPaid += toPay;
      remainingInvoice -= toPay;
      payment.remaining -= toPay;

      if (remainingInvoice <= 0) break;
    }
    //update invoice status
    if (simulatedPaid === 0) {
      invoice.status = "unpaid";
    } else if (simulatedPaid < invoice.netAmount) {
      invoice.status = "partial";
    } else {
      invoice.status = "paid";
    }
    invoice.payments = simulatedPaid;
    await invoice.save();
  }
};

// get next payment code
const getNextPaymentCode = async (req, res, next) => {
  try {
    const lastPayment = await Payment.findOne({}).sort({ code: -1 }).limit(1);
    const nextCode = lastPayment ? parseInt(lastPayment.code) + 1 : 1;
    return res.status(200).json({ code: nextCode });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//add new payment
const addNewPayment = async (req, res, next) => {
  const { code, type, partyId, amount, paymentMethode, paymentDate, notes } =
    req.body;
  try {
    if (!type || !partyId || !amount) {
      return next(new CustomError("Missing required fields", 400));
    }
    const payment = await Payment.create({
      code,
      type,
      partyId,
      amount,
      paymentMethode,
      paymentDate,
      notes,
    });
    // recalculate
    await recalcInvoicesForParty(type, partyId);
    if (payment !== null) {
      const _newPayment = await Payment.findOne({ _id: payment._id })
        .populate("partyId", "_id name credit debit")
        .lean();
      return res.status(200).json({ payment: _newPayment });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//update payment
const updatePayment = async (req, res, next) => {
  const { id } = req.params;
  const { amount, paymentMethode, paymentDate, notes } = req.body;
  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          amount,
          paymentMethode,
          paymentDate,
          notes,
        },
      },
      { new: true, upsert: true, runValidators: true }
    )
      .populate("partyId", "_id name credit debit")
      .lean();
    if (updatedPayment) {
      await recalcInvoicesForParty(
        updatedPayment.type,
        updatedPayment.partyId._id
      );
      return res.status(200).json({ payment: updatedPayment });
    } else {
      return next(new CustomError("This payement is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

//delete payment
const deletePayment = async (req, res, next) => {
  const { id } = req.params;
  try {
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) return next(new CustomError("Payment not found", 404));
    await recalcInvoicesForParty(payment.type, payment.partyId);

    return res
      .status(200)
      .json({ message: "Payment deleted successfully", id });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

// fetch payments
const fetchPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .populate("partyId", "_id name credit debit")
      .lean();

    return res.status(200).json({ payments });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

module.exports = {
  addNewPayment,
  updatePayment,
  deletePayment,
  fetchPayments,
  getNextPaymentCode,
};
