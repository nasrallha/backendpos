const mongoose = require("mongoose");
const Sales = require("../models/salesModel.js");
const CustomError = require("../config/CustomError.js");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
dayjs.extend(quarterOfYear);

// get sale next invoice number
const getNextInvoiceNumber = async (req, res) => {
  const { branch } = req.query;
  const lastInvoice = await Sales.findOne({ branch })
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

//add new sale invoice

const createNewSalesInvoice = async (req, res, next) => {
  const {
    saleDate,
    saleTime,
    invoiceNumber,
    customer,
    isSale,
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
    profit,
    saleInvoiceNumber,
    branch,
  } = req.body;
  let invoiceStatus = "";
  if (isSale === false) {
    invoiceStatus = "returned";
  } else if (netAmount === paidAmount && remainingAmount === 0) {
    invoiceStatus = "paid";
  } else if (netAmount === remainingAmount && paidAmount === 0) {
    invoiceStatus = "unpaid";
  } else if (paidAmount < netAmount && remainingAmount !== 0) {
    invoiceStatus = "partial";
  }

  try {
    const exsisInvoice = await Sales.findOne({ invoiceNumber }).exec();
    if (exsisInvoice) {
      return next(new CustomError("This invoice is already exist", 400));
    }

    // create new invoice
    const newInvoice = await Sales.create({
      saleDate,
      saleTime,
      ISODATE:dayjs().format(),
      year:dayjs().year(),
      invoiceNumber,
      customer,
      isSale,
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
      profit,
      saleInvoiceNumber,
      status: invoiceStatus,
      createdBy: req.user.id,
      branch
    });

    if (newInvoice) {
      const _newInvoice = await Sales.findOne({_id:newInvoice._id}).populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" })
      .exec();
      return res.status(201).json({ invoice: _newInvoice });
    } else {
      return next(new CustomError("Something went wrong!", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// get sales invoice by invoice number
const getSalesInvoice = async (req, res, next) => {
  try {
    const { branch, invoice } = req.query;
    if (!branch || !invoice) {
      return next(
        new CustomError("Branch code and invoice number are required", 400)
      );
    }
    const result = await Sales.findOne({
      invoiceNumber:invoice,
      branch,
      isSale: true,
    })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" })
      .exec();
    if (result) {
      return res.status(200).json({ invoice: result });
    } else {
      return res
        .status(404)
        .json({ msg: "There is no sales invoice for this number." });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

// get sales invoice to return
const getSalesInvoiceToReturn = async (req, res, next) => {
  try {
    const { branch, invoice} = req.query;
    if (!branch || !invoice) {
      return next(
        new CustomError("Branch code and invoice number are required", 400)
      );
    }

    // get sales invoice
    const salesResult = await Sales.findOne({
      invoiceNumber:invoice,
      branch,
      isSale: true,
    })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" })
      .exec();
    // check resulte
    if (!salesResult) {
      return next(new CustomError("Invoice not found", 404));
    }
    // sales items
    const salesItems = salesResult.items;
    // get return sales invoices
    const returnSalesResult = await Sales.aggregate([
      { $match: { saleInvoiceNumber: invoice,branch, isSale: false } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          quantity: { $sum: "$items.quantity" },
        },
      },
    ]);

    // compare between salesitems and returned items
    const newItems = salesItems.map((s) => {
      const returnedItem = returnSalesResult.find(
        (r) => r._id.toString() === s.productId._id.toString()
      );

      const salesQty = s.quantity; // الكمية المباعة الأصلية
      const returnedQty = returnedItem ? returnedItem.quantity : 0; // ما تم إرجاعه مسبقًا
      const availableQty = Math.max(salesQty - returnedQty, 0); // الكمية المتبقية للإرجاع
      let status = "no-return";
      if (availableQty === 0) status = "full";
      else if (availableQty < salesQty) status = "partial";

      return {
        ...s.toObject(),
        status,
        salesQuantity: salesQty,
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
      baseItem: item.baseItem,
      unitCount: item.unitCount,
      quantity: item.returnedQuantity,
      returnedQuantity: item.returnedQuantity,
      salesQuantity: item.salesQuantity,
      status: item.status,
    }));
    const {
      _id,
      invoiceNumber,
      isSale,
      customer,
      createdBy,
      saleDate,
      ISODATE,
      saleTime,
      taxRate,
      isTaxIncluded,
    } = salesResult;
    const finalReturnSalesInvoice = {
      _id,
      invoiceNumber,
      saleDate,
      ISODATE,
      saleTime,
      taxRate,
      isTaxIncluded,
      isSale,
      customer,
      createdBy,
      items: cleanedItems,
    };

    return res
      .status(200)
      .json({ returnSalesInvoice: finalReturnSalesInvoice });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// get returnd sales invoic
const getReturnedSalesInvoice = async (req, res, next) => {
  try {
    const { branch, invoice } = req.query;
    if (!branch || !invoice) {
      return next(
        new CustomError("Branch code and invoice number are required", 400)
      );
    }
    const result = await Sales.findOne({
      invoiceNumber: invoice,
      branch,
      isSale: false,
    })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" })
      .exec();
    if (result) {
      return res.status(200).json({ invoice: result });
    } else {
      return res
        .status(404)
        .json({ msg: "There is no returned sales invoice for this number." });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// sales reports
const getSalesReport = async (req, res) => {
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
      query.invoiceNumber = invoice
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

      query.saleDate = { $gte: start, $lte: end };
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

      query.saleDate = {
        $gte: start.format("YYYY/MM/DD"),
        $lte: end.format("YYYY/MM/DD"),
      };
    }

    // 6- search by range date
    if (startDate && endDate) {
      const s = dayjs(startDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      const e = dayjs(endDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      query.saleDate = { $gte: s, $lte: e };
    }
    //check query is not empty
    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one valid filter",
      });
    }

    const sales = await Sales.find(query)
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" })
      .exec();
    if (sales.length > 0) {
      return res.status(200).json({ count: sales.length, sales });
    } else {
      return res
        .status(400)
        .json({ msg: "No sales invoice founded with filter"});
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// get all credit invoice for any customers

module.exports = {
  createNewSalesInvoice,
  getNextInvoiceNumber,
  getSalesInvoice,
  getSalesInvoiceToReturn,
  getReturnedSalesInvoice,
  getSalesReport,
};
