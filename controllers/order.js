const Order = require("../models/orderModel.js");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");
const CustomError = require("../config/CustomError.js");
const { default: mongoose } = require("mongoose");

// get next invoice number
const getNextInvoice = asyncErorrHandeler(async (req, res, next) => {
  try {
    const lastInvoice = await Order.findOne({}).sort({ invNo: -1 }).limit(1);
    const nextInvoiceNumber = parseInt(lastInvoice.invNo) + 1;
    if (lastInvoice) {
      return res.status(200).json({ nextInvoice: nextInvoiceNumber });
    } else {
      return res.status(200).json({ nextInvoice: 1 });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
//----------------------------------
//add new order
const addNewOrder = asyncErorrHandeler(async (req, res, next) => {
  const {
    customer,
    invNo,
    orderDate,
    orderTime,
    isOrder,
    isDiscount,
    discountType,
    discountValue,
    paid,
    remaining,
    paid1,
    paid2,
    paymentMethod1,
    paymentMethod2,
    orderItems,
    taxValue,
    priceIncludeTax,
    saleInvNo,
    orderQuantity,
    orderDiscount,
    orderSubTotal,
    orderSubTotal2,
    orderTax,
    orderTotal,
  } = req.body;
  try {
    //check if order is exsist
    const exsistOrder = await Order.findOne({ invNo }).exec();
    if (exsistOrder) {
      return next(new CustomError("This invoice is already exsist", 400));
    }
    // create new role
    const newOrder = await Order.create({
      customer,
      invNo,
      orderDate,
      orderTime,
      isOrder,
      isDiscount,
      discountType, // 1 => is discount percent  2 => is discont amount
      discountValue,
      taxValue,
      priceIncludeTax,
      paid1,
      paid2,
      paid,
      remaining,
      paymentMethod1,
      paymentMethod2,
      orderQuantity,
      orderSubTotal,
      orderDiscount,
      orderSubTotal2,
      orderTax,
      orderTotal,
      items: orderItems,
      saleInvNo: isOrder ? 0 : saleInvNo,
      status:
        isOrder === false
          ? "returned"
          : paid === 0
          ? "unpaid"
          : paid !== 0 && remaining !== 0
          ? "partially paid"
          : "paid",
      seller: req.user.id,
    });
    if (newOrder !== null) {
      const _newOrder = await Order.findOne({ _id: newOrder._id })
        .populate({ path: "customer", select: "_id name" })
        .populate({ path: "seller", select: "_id name" })
        .exec();
      return res.status(201).json({ order: _newOrder });
    } else {
      return next(
        new CustomError("This order don't created this is some error", 400)
      );
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
//get order by invoice number
const fetchOneOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ invNo: parseInt(req.query.invoice),isOrder:true })
      .populate({ path: "customer", select: "_id name" })
      .populate({ path: "seller", select: "_id name" })
      .populate({
        path: "items.productId",
        select: "_id code name ar_name cost",
      })
      .exec();
    if (order !== null) {
      return res.status(200).json({ order });
    } else {
      return next(new CustomError("There is no invoice for this number.", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// return order
const returnOrder = asyncErorrHandeler(async (req, res, next) => {
  // get sale order items
  const saleOrder = await Order.findOne({
    invNo: parseInt(req.query.invoice),
    isOrder: true,
  })
    .populate({ path: "customer", select: "_id name" })
    .populate({ path: "seller", select: "_id name" })
    .populate({ path: "items.productId", select: "_id code name ar_name cost" })
    .exec();
  if (saleOrder !== null) {
    // order items
    const orderItems = saleOrder.items.map((item) => {
      return {
        productId: item.productId,
        categoryId: item.categoryId,
        serial: item.serial,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        status: "",
      };
    });
    //get rerturn items from sale order
    const orderReturmItems = await Order.aggregate([
      // Stage 1: Filter pizza order documents by pizza size
      {
        $match: { saleInvNo: parseInt(req.query.invoice), isOrder: false },
      },
      // lookup products
      {
        $lookup: {
          from: "products",
          localField: "items.productId", // field in the orders collection
          foreignField: "_id", // field in the items collection
          pipeline: [
            {
              $project: {
                _id: 1,
                code: 1,
                name: 1,
                ar_name: 1,
                cost: 1,
              },
            },
          ],
          as: "RItems",
        },
      },
      // new items array
      {
        $addFields: {
          returnedItems: {
            $map: {
              input: "$items",
              as: "i",
              in: {
                $mergeObjects: [
                  "$$i",
                  {
                    $first: {
                      $filter: {
                        input: "$RItems",
                        cond: { $eq: ["$$this._id", "$$i.productId"] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $project: {items: 0, RItems: 0 } },
      // unwind////////////
      { $unwind: "$returnedItems" },
      {
        $group: {
          _id: "$returnedItems.productId",
          quantity: { $sum: "$returnedItems.quantity" },
          price: { $first: "$returnedItems.price" },
          name: { $first: "$returnedItems.name" },
          ar_name: { $first: "$returnedItems.ar_name" },
          serial: { $first: "$returnedItems.serial" },
          code: { $first: "$returnedItems.code" },
          count: { $sum: 1 },
        },
      },
    ]);
      // check item exsist in orderReturmItems or not
      const arr = [];
      orderItems.forEach((p) => {
        if (
          !orderReturmItems.includes(
            orderReturmItems.find(
              (item) => item._id.toString() === p.productId._id.toString()
            )
          )
        ) {
          arr.push(p);
        } else {
          orderReturmItems.forEach((rp) => {
            if (
              p.productId._id.toString() === rp._id.toString() &&
              rp.quantity === p.quantity
            ) {
              p.status = "full";
              arr.push(p);
            } else if (
              p.productId._id.toString() === rp._id.toString() &&
              rp.quantity < p.quantity
            ) {
              p.quantity -= rp.quantity;
              p.status = "partial",
              arr.push(p);
            }
          });
        }
      });
      const { _id, invNo, customer, seller, priceIncludeTax, taxValue } =
        saleOrder;
      const rOrder = {
        _id,
        invNo,
        customer,
        seller,
        priceIncludeTax,
        taxValue,
        items: arr,
      };
      return res.status(200).json({ orderReturmItems,rOrder });
   
  } else {
    return next(new CustomError("There is no invoice for this number.", 400));
  }
});

// ----------------------------------------------------------------------------------------------
//order reports
const fetchSaesReports = asyncErorrHandeler(async (req, res, next) => {
  try {
    const { invoice, customer, seller, isOrder, period ,status,payment} = req.query;
    let newPeriod = "";
    if (period !== "") {
      newPeriod = period.split(",");
    }
    const startDate = newPeriod[0];
    const endDate = newPeriod[1];
    let filter = {};
    if (
      invoice !== "" &&
      customer === "" &&
      seller === "" &&
      isOrder === "all" &&
      period === "" &&
      status === "" &&
      payment === ""
    ) {
      filter = {
          invNo: parseInt(invoice)
        };
    } else if (
      invoice === "" &&
      customer !== "" &&
      seller === "" &&
      isOrder === "all" &&
      period === "" &&
      status === "" &&
      payment === ""
    ) {
      filter = { customer: new mongoose.Types.ObjectId(customer) };
    } else if (
      invoice === "" &&
      customer === "" &&
      seller !== "" &&
      isOrder === "all" &&
      period === ""&&
      status === "" &&
      payment === ""
    ) {
      filter = { seller: new mongoose.Types.ObjectId(seller) };
    } else if (
      invoice === "" &&
      customer !== "" &&
      seller === "" &&
      isOrder !== "all" &&
      period === ""&&
      status === "" &&
      payment === ""
    ) {
        filter = {
          customer: new mongoose.Types.ObjectId(customer),
          isOrder: isOrder ==='true'? true :false 
        };
    } else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder === "all" &&
      period !== ""&&
      status === "" &&
      payment === ""
    ) {
      filter = { orderDate: { $gte: startDate, $lte: endDate } };
    } else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder !== "all" &&
      period !== ""&&
      status === "" &&
      payment === ""
    ) {
        filter = {
          orderDate: { $gte: startDate, $lte: endDate },
          isOrder: isOrder ==='true'? true :false  
        };
    } else if (
      invoice === "" &&
      customer !== "" &&
      seller === "" &&
      isOrder === "all" &&
      period !== ""&&
      status === "" &&
      payment === ""
    ) {
      filter = {
        customer: new mongoose.Types.ObjectId(customer),
        orderDate: { $gte: startDate, $lte: endDate },
      };
    } else if (
      invoice === "" &&
      customer !== "" &&
      seller === "" &&
      isOrder !== "all" &&
      period !== ""&&
      status === "" &&
      payment === ""
    ) {
      
        filter = {
          customer: new mongoose.Types.ObjectId(customer),
          orderDate: { $gte: startDate, $lte: endDate },
          isOrder: isOrder ==='true'? true :false   
        };
    } else if (
      invoice === "" &&
      customer === "" &&
      seller !== "" &&
      isOrder === "all" &&
      period !== ""&&
      status === "" &&
      payment === ""
    ) {
      filter = {
        seller: new mongoose.Types.ObjectId(seller),
        orderDate: { $gte: startDate, $lte: endDate },
      };
    } 
    else if (
      invoice === "" &&
      customer === "" &&
      seller !== "" &&
      isOrder !== "all" &&
      period !== ""&&
      status === "" &&
      payment === ""
    ) {
        filter = {
          seller: new mongoose.Types.ObjectId(seller),
          orderDate: { $gte: startDate, $lte: endDate },
          isOrder: isOrder ==='true'? true :false   
        };
      }else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder === "all" &&
      period === ""&&
      status !== "" &&
      payment === ""
    ) {
        filter = {
          status:status
        };
    }else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder === "all" &&
      period !== ""&&
      status !== "" &&
      payment === ""
    ) {
        filter = {
          status:status,
          orderDate: { $gte: startDate, $lte: endDate },
        };
    }
    else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder !== "all" &&
      period === ""&&
      status !== "" &&
      payment === ""
    ) {
        filter = {
          status:status,
          isOrder: isOrder ==='true'? true :false  
        };
    }else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder !== "all" &&
      period !== ""&&
      status !== "" &&
      payment === ""
    ) {
        filter = {
          status:status,
          isOrder: isOrder ==='true'? true :false ,
          orderDate: { $gte: startDate, $lte: endDate },
        };
    }
    else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder === "all" &&
      period === ""&&
      status === "" &&
      payment !== ""
    ) {
        filter = {
          $or: [ {paymentMethod1 : parseInt(payment) }, { paymentMethod2 : parseInt(payment)} ] 
        }; 
    }else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder !== "all" &&
      period === ""&&
      status === "" &&
      payment !== ""
    ) {
        filter = {
          $or: [ {paymentMethod1 : parseInt(payment) }, { paymentMethod2 : parseInt(payment)} ] ,
          isOrder: isOrder ==='true'? true :false 
        }; 
    }else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder === "all" &&
      period !== ""&&
      status === "" &&
      payment !== ""
    ) {
        filter = {
          $or: [ {paymentMethod1 : parseInt(payment) }, { paymentMethod2 : parseInt(payment)} ] ,
           orderDate: { $gte: startDate, $lte: endDate },
        }; 
    }else if (
      invoice === "" &&
      customer === "" &&
      seller === "" &&
      isOrder !== "all" &&
      period !== ""&&
      status === "" &&
      payment !== ""
    ) {
        filter = {
          $or: [ {paymentMethod1 : parseInt(payment) }, { paymentMethod2 : parseInt(payment)} ] ,
           orderDate: { $gte: startDate, $lte: endDate },
           isOrder: isOrder ==='true'? true :false ,
        }; 
    }
    else {
      return res.status(400).json({ msg: "Select correct filter" });
    }
    const orders = await Order.find({...filter}).populate({ path: "customer", select: "_id name" })
    .populate({ path: "seller", select: "_id name" })
    if (orders.length !== 0) {
      return res.status(200).json({ orders });
    } else {
      return res
        .status(404)
        .json({ orders: [], msg: "No data with this filter" });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});

module.exports = {
  getNextInvoice,
  addNewOrder,
  fetchOneOrder,
  returnOrder,
  fetchSaesReports,
};
