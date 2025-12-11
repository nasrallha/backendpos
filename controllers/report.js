const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Sales = require("../models/salesModel.js");
const Purchases = require("../models/purchasesModel.js");
const Payments = require("../models/paymentsModel.js");
const Vouchers = require("../models/voucherModel.js");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
const CustomError = require("../config/CustomError.js");
dayjs.extend(quarterOfYear);

// tax reports
const getTaxeport = async (req, res) => {
  try {
    const { year, month, quarter, startDate, endDate } = req.query;
    // check query
    if (!year && !month && !quarter && !startDate && !endDate) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one filter",
      });
    }
    let salesQuery = {};
    let purchasesQuery = {};

    // 4- search by month
    if (year && month) {
      const start = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .startOf("month")
        .format("YYYY/MM/DD");

      const end = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .endOf("month")
        .format("YYYY/MM/DD");
      salesQuery.saleDate = { $gte: start, $lte: end };
      purchasesQuery.purchaseDate = { $gte: start, $lte: end };
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

      salesQuery.saleDate = {
        $gte: start.format("YYYY/MM/DD"),
        $lte: end.format("YYYY/MM/DD"),
      };
      purchasesQuery.purchaseDate = {
        $gte: start.format("YYYY/MM/DD"),
        $lte: end.format("YYYY/MM/DD"),
      };
    }

    // 6- search by range date
    if (startDate && endDate) {
      const s = dayjs(startDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      const e = dayjs(endDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      salesQuery.saleDate = { $gte: s, $lte: e };
      purchasesQuery.purchaseDate = { $gte: s, $lte: e };
    }
    //check query is not empty
    if (
      Object.keys(salesQuery).length === 0 &&
      Object.keys(purchasesQuery).length === 0
    ) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one valid filter",
      });
    }
    // ---- sales tax and sales return tax ----
    const salesAgg = await Sales.aggregate([
      { $match: salesQuery },
      {
        $group: {
          _id: "$isSale",
          totalTax: { $sum: "$taxAmount" },
        },
      },
    ]);

    let salesTax = 0;
    let salesReturnTax = 0;

    salesAgg.forEach((row) => {
      if (row._id) salesTax = row.totalTax;
      else salesReturnTax = row.totalTax;
    });

    // ---- purchases tax and return purchases tax ----
    const purchaseAgg = await Purchases.aggregate([
      { $match: purchasesQuery },
      {
        $group: {
          _id: "$isPurchase",
          totalTax: { $sum: "$taxAmount" },
        },
      },
    ]);

    let purchaseTax = 0;
    let purchaseReturnTax = 0;

    purchaseAgg.forEach((row) => {
      if (row._id) purchaseTax = row.totalTax;
      else purchaseReturnTax = row.totalTax;
    });

    //net tax
    const totalSalesTax = salesTax - salesReturnTax;
    const totalPurchaseTax = purchaseTax - purchaseReturnTax;
    const netTax = totalSalesTax - totalPurchaseTax;

    return res.status(200).json({
      success: true,
      report: {
        salesTax,
        salesReturnTax: -salesReturnTax,
        totalSalesTax,
        purchaseTax,
        purchaseReturnTax: -purchaseReturnTax,
        totalPurchaseTax,
        netTax,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// stock report
const getInventoryReport = async (req, res) => {
  try {
    const {
      year,
      month,
      quarter,
      startDate,
      endDate,
      barcode,
      category,
      brand,
    } = req.query;
    let matchStage = {};
    // check query
    if (
      !year &&
      !month &&
      !quarter &&
      !startDate &&
      !endDate &&
      !category &&
      !brand &&
      !barcode
    ) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one filter",
      });
    } else {
      // filter main products
      matchStage = { $or: [{ baseItem: "" }, { baseItem: null }] };
    }

    if (barcode) matchStage.barcode = barcode.trim();
    if (category) matchStage.category = new mongoose.Types.ObjectId(category);
    if (brand) matchStage.brand = new mongoose.Types.ObjectId(brand);

    // period filter
    let dateFilter = {};
    if (year && month) {
      const start = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .startOf("month")
        .toDate();
      const end = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .endOf("month")
        .toDate();
      dateFilter = { $gte: start, $lte: end };
    } else if (year && quarter) {
      const start = dayjs()
        .year(Number(year))
        .quarter(Number(quarter))
        .startOf("quarter")
        .toDate();
      const end = dayjs()
        .year(Number(year))
        .quarter(Number(quarter))
        .endOf("quarter")
        .toDate();
      dateFilter = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      const s = dayjs(startDate, "YYYY/MM/DD").toDate();
      const e = dayjs(endDate, "YYYY/MM/DD").toDate();
      dateFilter = { $gte: s, $lte: e };
    }

    const report = await Product.aggregate([
      { $match: matchStage },

      // secendry items
      {
        $lookup: {
          from: "products",
          let: { parentId: { $toString: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$baseItem", "$$parentId"] } } },
          ],
          as: "childItems",
        },
      },

      // get category
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      // get brand
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandData",
        },
      },

      // حساب الرصيد الابتدائي شامل الفرعي
      {
        $addFields: {
          startCurrent: {
            $add: [
              { $multiply: ["$startStock", "$unitCount"] },
              {
                $sum: {
                  $map: {
                    input: "$childItems",
                    as: "c",
                    in: { $multiply: ["$$c.startStock", "$$c.unitCount"] },
                  },
                },
              },
            ],
          },
        },
      },

      // حساب الحركات من sales
      {
        $lookup: {
          from: "sales",
          let: {
            allProductIds: { $concatArrays: [["$_id"], "$childItems._id"] },
          },
          pipeline: [
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $in: ["$items.productId", "$$allProductIds"] },
              },
            },
            ...(dateFilter.$gte ? [{ $match: { saleDate: dateFilter } }] : []),
            {
              $addFields: {
                adjustedQuantity: {
                  $multiply: [
                    "$items.quantity",
                    { $ifNull: ["$items.unitCount", 1] },
                  ],
                },
              },
            },
            {
              $group: { _id: "$isSale", total: { $sum: "$adjustedQuantity" } },
            },
          ],
          as: "salesAgg",
        },
      },

      // حساب الحركات من purchases
      {
        $lookup: {
          from: "purchases",
          let: {
            allProductIds: { $concatArrays: [["$_id"], "$childItems._id"] },
          },
          pipeline: [
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $in: ["$items.productId", "$$allProductIds"] },
              },
            },
            ...(dateFilter.$gte
              ? [{ $match: { purchaseDate: dateFilter } }]
              : []),
            {
              $addFields: {
                adjustedQuantity: {
                  $multiply: [
                    "$items.quantity",
                    { $ifNull: ["$items.unitCount", 1] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$isPurchase",
                total: { $sum: "$adjustedQuantity" },
              },
            },
          ],
          as: "purchaseAgg",
        },
      },

      // دمج الحركات
      {
        $addFields: {
          totalSales: {
            $ifNull: [
              {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$salesAgg",
                        cond: { $eq: ["$$this._id", true] },
                      },
                    },
                    as: "f",
                    in: "$$f.total",
                  },
                },
              },
              0,
            ],
          },
          totalSalesReturns: {
            $ifNull: [
              {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$salesAgg",
                        cond: { $eq: ["$$this._id", false] },
                      },
                    },
                    as: "f",
                    in: "$$f.total",
                  },
                },
              },
              0,
            ],
          },
          totalPurchases: {
            $ifNull: [
              {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$purchaseAgg",
                        cond: { $eq: ["$$this._id", true] },
                      },
                    },
                    as: "f",
                    in: "$$f.total",
                  },
                },
              },
              0,
            ],
          },
          totalPurchaseReturns: {
            $ifNull: [
              {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$purchaseAgg",
                        cond: { $eq: ["$$this._id", false] },
                      },
                    },
                    as: "f",
                    in: "$$f.total",
                  },
                },
              },
              0,
            ],
          },
        },
      },

      // الرصيد النهائي
      {
        $addFields: {
          startStock: {
            $add: [
              "$startCurrent",
              "$totalPurchases",
              "$totalSalesReturns",
              {
                $multiply: [
                  -1,
                  { $add: ["$totalSales", "$totalPurchaseReturns"] },
                ],
              },
            ],
          },
        },
      },

      // النتيجة النهائية
      {
        $project: {
          productId: "$_id",
          barcode: 1,
          name: 1,
          ar_name: 1,
          taxRate: 1,
          priceIncludeTax: 1,
          costIncludeTax: 1,
          price: 1,
          cost: 1,
          brandId: "$brand",
          brandName: { $arrayElemAt: ["$brandData.name", 0] },
          brandArName: { $arrayElemAt: ["$brandData.ar_name", 0] },
          categoryId: "$category",
          categoryName: { $arrayElemAt: ["$categoryData.name", 0] },
          categoryArName: { $arrayElemAt: ["$categoryData.ar_name", 0] },
          startCurrent: 1,
          totalSales: 1,
          totalSalesReturns: 1,
          totalPurchases: 1,
          totalPurchaseReturns: 1,
          startStock: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};
const getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;

    const [purchasesReport, salesReport, paymentsReport, vouchersReport] =
      await Promise.all([
        // مشتريات + مرتجع مشتريات
        Purchases.aggregate([
          {
            $facet: {
              purchases: [
                { $match: { purchaseDate: date, isPurchase: true } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "cash"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "cash"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "card"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "card"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "transfer"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "transfer"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    credit: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "credit"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "credit"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    total: { $sum: { $add: ["$paidAmount1", "$paidAmount2"] } },
                  },
                },
              ],
              purchaseReturns: [
                { $match: { purchaseDate: date, isPurchase: false } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "cash"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "cash"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "card"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "card"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "transfer"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "transfer"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    credit: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "credit"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "credit"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    total: { $sum: { $add: ["$paidAmount1", "$paidAmount2"] } },
                  },
                },
              ],
            },
          },
        ]),

        // مبيعات + مرتجع مبيعات
        Sales.aggregate([
          {
            $facet: {
              sales: [
                { $match: { saleDate: date, isSale: true } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "cash"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "cash"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "card"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "card"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "transfer"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "transfer"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    credit: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "credit"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "credit"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    total: { $sum: { $add: ["$paidAmount1", "$paidAmount2"] } },
                  },
                },
              ],
              salesReturns: [
                { $match: { saleDate: date, isSale: false } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "cash"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "cash"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "card"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "card"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "transfer"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "transfer"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    credit: {
                      $sum: {
                        $add: [
                          {
                            $cond: [
                              { $eq: ["$payment1", "credit"] },
                              "$paidAmount1",
                              0,
                            ],
                          },
                          {
                            $cond: [
                              { $eq: ["$payment2", "credit"] },
                              "$paidAmount2",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                    total: { $sum: { $add: ["$paidAmount1", "$paidAmount2"] } },
                  },
                },
              ],
            },
          },
        ]),

        // الدفعات (cash, card, transfer فقط)
        Payments.aggregate([
          {
            $facet: {
              incomingPayments: [
                { $match: { paymentDate: date, type: "Customer" } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "cash"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "card"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "transfer"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    total: { $sum: "$amount" },
                  },
                },
              ],
              outcomingPayments: [
                { $match: { paymentDate: date, type: "Supplier" } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "cash"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "card"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "transfer"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    total: { $sum: "$amount" },
                  },
                },
              ],
            },
          },
        ]),

        // السندات (cash, card, transfer فقط)
        Vouchers.aggregate([
          {
            $facet: {
              incomingVouchers: [
                { $match: { voucherDate: date, type: "payment" } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "cash"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "card"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "transfer"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    total: { $sum: "$amount" },
                  },
                },
              ],
              outcomingVouchers: [
                { $match: { voucherDate: date, type: "receipt" } },
                {
                  $group: {
                    _id: null,
                    cash: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "cash"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    card: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "card"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    transfer: {
                      $sum: {
                        $cond: [
                          { $eq: ["$paymentMethode", "transfer"] },
                          "$amount",
                          0,
                        ],
                      },
                    },
                    total: { $sum: "$amount" },
                  },
                },
              ],
            },
          },
        ]),
      ]);

    // حساب netReport
    const netReport = {
      cash:
        (salesReport[0].sales[0]?.cash || 0) +
        (paymentsReport[0].incomingPayments[0]?.cash || 0) +
        (vouchersReport[0].incomingVouchers[0]?.cash || 0) -
        (salesReport[0].salesReturns[0]?.cash || 0) -
        (paymentsReport[0].outcomingPayments[0]?.cash || 0) -
        (vouchersReport[0].outcomingVouchers[0]?.cash || 0),
      card:
        (salesReport[0].sales[0]?.card || 0) +
        (paymentsReport[0].incomingPayments[0]?.card || 0) +
        (vouchersReport[0].incomingVouchers[0]?.card || 0) -
        (salesReport[0].salesReturns[0]?.card || 0) -
        (paymentsReport[0].outcomingPayments[0]?.card || 0) -
        (vouchersReport[0].outcomingVouchers[0]?.card || 0),
      transfer:
        (salesReport[0].sales[0]?.transfer || 0) +
        (paymentsReport[0].incomingPayments[0]?.transfer || 0) +
        (vouchersReport[0].incomingVouchers[0]?.transfer || 0) -
        (salesReport[0].salesReturns[0]?.transfer || 0) -
        (paymentsReport[0].outcomingPayments[0]?.transfer || 0) -
        (vouchersReport[0].outcomingVouchers[0]?.transfer || 0),
      credit:
        (salesReport[0].sales[0]?.credit || 0) -
        (salesReport[0].salesReturns[0]?.credit || 0),
    };

    res.status(200).json({
      purchases: purchasesReport[0].purchases[0] || {},
      purchaseReturns: purchasesReport[0].purchaseReturns[0] || {},
      sales: salesReport[0].sales[0] || {},
      salesReturns: salesReport[0].salesReturns[0] || {},
      inPayments: paymentsReport[0].incomingPayments[0] || {},
      outPayments: paymentsReport[0].outcomingPayments[0] || {},
      inVouchers: vouchersReport[0].incomingVouchers[0] || {},
      outVouchers: vouchersReport[0].outcomingVouchers[0] || {},
      netReport,
      date: date,
    });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// bills profit reports
const getBillsProfitReport = async (req, res) => {
  try {
    const { invoice, year, month, quarter, startDate, endDate, branch } =
      req.query;
    let query = {};
    // check query
    if (!invoice && !month && !quarter && !startDate && !endDate) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one filter",
      });
    } else {
      query.branch = branch;
    }
    // 1- search by invoice number
    if (invoice) {
      query.invoiceNumber = invoice;
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
      .sort({ createdAt: 1 })
      .populate({ path: "createdBy", select: "_id name" })
      .populate({ path: "customer" })
      .exec();
    if (sales.length > 0) {
      return res.status(200).json({ count: sales.length, bills: sales });
    } else {
      return res
        .status(400)
        .json({ msg: "No sales invoice founded with filter" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// net profit
const getNetProfit = async (req, res) => {
  try {
    const { year, month, quarter, startDate, endDate, branch } = req.query;

    let querySales = {};
    let queryPurchases = {};
    let queryVouchers = {};

    if (branch) {
      querySales.branch = branch;
      queryPurchases.branch = branch;
      // queryVouchers.branch = branch;
    }
    // month
    if (year && month) {
      const start = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .startOf("month")
        .format("YYYY/MM/DD");

      const end = dayjs(`${year}/${month}/01`, "YYYY/MM/DD")
        .endOf("month")
        .format("YYYY/MM/DD");

      querySales.saleDate = { $gte: start, $lte: end };
      queryPurchases.purchaseDate = { $gte: start, $lte: end };
      queryVouchers.voucherDate = { $gte: start, $lte: end };
    }

    // quarter
    if (year && quarter) {
      const start = dayjs()
        .year(Number(year))
        .quarter(Number(quarter))
        .startOf("quarter")
        .format("YYYY/MM/DD");

      const end = dayjs()
        .year(Number(year))
        .quarter(Number(quarter))
        .endOf("quarter")
        .format("YYYY/MM/DD");

      querySales.saleDate = { $gte: start, $lte: end };
      queryPurchases.purchaseDate = { $gte: start, $lte: end };
      queryVouchers.voucherDate = { $gte: start, $lte: end };
    }

    // period
    if (startDate && endDate) {
      const s = dayjs(startDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      const e = dayjs(endDate, "YYYY/MM/DD").format("YYYY/MM/DD");

      querySales.saleDate = { $gte: s, $lte: e };
      queryPurchases.purchaseDate = { $gte: s, $lte: e };
      queryVouchers.voucherDate = { $gte: s, $lte: e };
    }

    // check filters
    if (
      Object.keys(querySales).length === 0 &&
      Object.keys(queryPurchases).length === 0 &&
      Object.keys(queryVouchers).length === 0
    ) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one valid filter",
      });
    }

    // 1- sales
    const salesAgg = await Sales.aggregate([
      { $match: { ...querySales, isSale: true } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$profit" },
        },
      },
    ]);

    // 2-  sales return
    const salesReturnAgg = await Sales.aggregate([
      { $match: { ...querySales, isSale: false } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$profit" },
        },
      },
    ]);

    // 3- purchases
    const purchasesAgg = await Purchases.aggregate([
      { $match: { ...queryPurchases, isPurchase: true } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 4-  purchases return
    const purchaseReturnAgg = await Purchases.aggregate([
      { $match: { ...queryPurchases, isPurchase: false } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 5-  vouchers payments
    const vouchersPaymentsAgg = await Vouchers.aggregate([
      { $match: { ...queryVouchers, type: "payment" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // 6- vourchers recipt
    const vouchersReceiptAgg = await Vouchers.aggregate([
      { $match: { ...queryVouchers, type: "receipt" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const sales = salesAgg[0] || { totalAmount: 0, totalProfit: 0 };
    const salesReturn = salesReturnAgg[0] || { totalAmount: 0, totalProfit: 0 };
    const purchases = purchasesAgg[0] || { totalAmount: 0 };
    const purchaseReturn = purchaseReturnAgg[0] || { totalAmount: 0 };
    const vouchersPayments = vouchersPaymentsAgg[0] || { totalAmount: 0 };
    const vouchersReceipt = vouchersReceiptAgg[0] || { totalAmount: 0 };

    // net profit
    const netProfit =
      sales.totalAmount -
      salesReturn.totalAmount -
      (purchases.totalAmount - purchaseReturn.totalAmount) -
      vouchersPayments.totalAmount +
      vouchersReceipt.totalAmount;

    res.status(200).json({
      success: true,
      data: {
        sales,
        salesReturn,
        purchases,
        purchaseReturn,
        vouchersPayments,
        vouchersReceipt,
        netProfit: Math.round(netProfit, 3),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getTaxeport,
  getInventoryReport,
  getDailyReport,
  getBillsProfitReport,
  getNetProfit,
};
