const mongoose = require("mongoose");
const Purchases = require("../models/purchasesModel.js");
const CustomError = require("../config/CustomError.js");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
dayjs.extend(quarterOfYear);

// get purchase next invoice number
const getNextInvoiceNumber = async (req, res) => {
  const { branch } = req.query;
   const lastInvoice = await Purchases.findOne({ branch })
     .sort({ createdAt: -1 })
     .lean();
   let newNumber = 1;
   let invoiceNumber = 1;
   if (lastInvoice && lastInvoice.invoiceNumber) {
     const lastNumPart = parseInt(lastInvoice.invoiceNumber);
     newNumber = lastNumPart + 1;
     invoiceNumber = newNumber;
   } else {
     invoiceNumber = 1;
   }
 
   return res.status(200).json({ invoiceNumber });
};
//add new purchase invoice

const createNewPurchaseInvoice = async (req, res, next) => {
  const {
    purchaseDate,
    purchaseTime,
    invoiceNumber,
    supplier,
    isPurchase,
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
    paidAmount,
    remainingAmount,
    payment1,
    payment2,
    paidAmount1,
    paidAmount2,
    purchaseInvoiceNumber,
    branch,
  } = req.body;

    let invoiceStatus = "";
  if (isPurchase === false) {
    invoiceStatus = "returned";
  } else if (netAmount === paidAmount && remainingAmount === 0) {
    invoiceStatus = "paid";
  } else if (netAmount === remainingAmount && paidAmount === 0) {
    invoiceStatus = "unpaid";
  } else if (paidAmount < netAmount && remainingAmount !== 0) {
    invoiceStatus = "partially";
  }

  try {
    const exsisInvoice = await Purchases.findOne({ invoiceNumber }).exec();
    if (exsisInvoice) {
      return next(new CustomError("This invoice is already exist", 400));
    }
    // create new invoice
    const newInvoice = await Purchases.create({
      purchaseDate,
      purchaseTime,
      ISODATE:dayjs().format(),
      year:dayjs().year(),
      invoiceNumber,
      supplier,
      isPurchase,
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
      paidAmount,
      remainingAmount,
      payment1,
      payment2,
      paidAmount1,
      paidAmount2,
      purchaseInvoiceNumber,
      status: invoiceStatus,
      createdBy: req.user.id,
      branch,
    });

    if (newInvoice) {
      return res.status(201).json({ invoice: newInvoice });
    } else {
      return next(new CustomError("Something went wrong!", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// get purchase invoice by invoice number
const getPurchaseInvoice = async (req, res, next) => {
  try {
    const { branch, invoice } = req.query;
    if (!branch || !invoice) {
      return next(
        new CustomError("Branch code and invoice number are required", 400)
      );
    }
    const result = await Purchases.findOne({
      invoiceNumber: invoice,
      branch,
      isPurchase: true,
    })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "supplier" })
      .exec();
    if (result) {
      return res.status(200).json({ invoice: result });
    } else {
      return res
        .status(404)
        .json({ msg: "There is no purchase invoice for this number." });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

// get purchase invoice to return
const getPurchaseInvoiceToReturn = async (req, res, next) => {
  try {
    const { branch, invoice } = req.query;
    if (!branch || !invoice) {
      return next(
        new CustomError("Branch code and invoice number are required", 400)
      );
    }

    // get purchase invoice
    const purchaseResult = await Purchases.findOne({
      invoiceNumber: invoice,
      branch,
      isPurchase: true,
    })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "supplier" })
      .exec();
    // check resulte
    if (!purchaseResult) {
      return next(new CustomError("Invoice not found", 404));
    }
    // purchases items
    const purchaseItems = purchaseResult.items;
    // get return purchase  invoices
    const returnPurchaseResult = await Purchases.aggregate([
      { $match: { purchaseInvoiceNumber: invoice,branch, isPurchase: false } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          quantity: { $sum: "$items.quantity" },
        },
      },
    ]);
    // compare between purchase items and returned items
    const newItems = purchaseItems.map((s) => {
      const returnedItem = returnPurchaseResult.find(
        (r) => r._id.toString() === s.productId._id.toString()
      );
      const purchaseQty = s.quantity; 
      const returnedQty = returnedItem ? returnedItem.quantity : 0; 
      const availableQty = Math.max(purchaseQty - returnedQty, 0); 
      let status = "no-return";
      if (availableQty === 0) status = "full";
      else if (availableQty < purchaseQty) status = "partial";
      return {
        ...s.toObject(),
        status,
        purchaseQuantity: purchaseQty,
        returnedQuantity: availableQty,
      };
    });

    // clean items
    const cleanedItems = newItems.map((item) => ({
      productId: item.productId._id || item.productId,
      barcode: item.barcode,
      categoryId: item.categoryId,
      brandId: item.brandId,
      unitId: item.unitId,
      name: item.name,
      ar_name: item.ar_name,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost,
      priceIncludeTax: item.priceIncludeTax,
      taxRate: item.taxRate,
      discountType: item.discountType,
      discountValue: item.discountValue,
      discountAmount: item.discountAmount,
      serial: item.serial,
      baseItem:item.baseItem,
      unitCount:item.unitCount,
      quantity: item.returnedQuantity,
      returnedQuantity: item.returnedQuantity,
      purchaseQuantity: item.purchaseQty,
      status: item.status,
    }));
    const {
      _id,
      invoiceNumber,
      isPurchase,
      supplier,
      createdBy,
      purchaseDate,
      purchaseTime,
      taxRate,
      isTaxIncluded,
    } = purchaseResult;
    const finalReturnPurchaseInvoice = {
      _id,
      invoiceNumber,
      branch,
      purchaseDate,
      purchaseTime,
      taxRate,
      isTaxIncluded,
      isPurchase,
      supplier,
      createdBy,
      items: cleanedItems,
    };

    return res
      .status(200)
      .json({ returnPurchaseInvoice: finalReturnPurchaseInvoice });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// get returnd purchase invoic
const getReturnedPurchaseInvoice = async (req, res, next) => {
  try {
    const { branch, invoice } = req.query;
    if (!branch || !invoice) {
      return next(
        new CustomError("Branch code and invoice number are required", 400)
      );
    }
    const result = await Purchases.findOne({
      invoiceNumber: invoice,
      branch,
      isPurchase: false,
    })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "supplier" })
      .exec();
    if (result) {
      return res.status(200).json({ invoice: result });
    } else {
      return res
        .status(404)
        .json({ msg: "There is no returned purchases invoice for this number." });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// purchases reports
const getPurchasesReport = async (req, res) => {
  try {
    const {
      invoice,
      payment,
      status,
      year,
      month,
      quarter,
      startDate,
      endDate,
      branch,
    } = req.query;
    // check query
    if (
      !invoice &&
      !payment &&
      !status &&
      !year &&
      !month &&
      !quarter &&
      !startDate &&
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one filter",
      });
    }

    let query = {};
      query.branch = branch
    // 1- search by invoice number
    if (invoice) {
      query.invoiceNumber = invoice;
    }

    // 2- search by invoice status
    if (status) {
      query.status = status;
    }

    // 3- search by paymentMethod
    if (payment) {
      query.$or = [{ payment1: payment }, { payment2: payment }];
    }

    // 4- search by month
    if (year && month) {
      const start = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .startOf("month")
        .format("YYYY/MM/DD");

      const end = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .endOf("month")
        .format("YYYY/MM/DD");

      query.purchaseDate = { $gte: start, $lte: end };
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

      query.purchaseDate = {
        $gte: start.format("YYYY/MM/DD"),
        $lte: end.format("YYYY/MM/DD"),
      };
    }

    // 6- search by range date
    if (startDate && endDate) {
      const s = dayjs(startDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      const e = dayjs(endDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      query.purchaseDate = { $gte: s, $lte: e };
    }
    //check query is not empty
    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one valid filter",
      });
    }

    const purchases = await Purchases.find(query)
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "supplier" })
      .exec();
    if (purchases.length > 0) {
      return res.status(200).json({ count: purchases.length, purchases });
    } else {
      return res
        .status(400)
        .json({ msg: "No purchase invoice founded with filter"});
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = {
  createNewPurchaseInvoice,
  getNextInvoiceNumber,
  getPurchaseInvoice,
  getPurchaseInvoiceToReturn,
  getReturnedPurchaseInvoice,
  getPurchasesReport
};
