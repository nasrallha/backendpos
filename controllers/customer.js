const Customer = require("../models/customerModel.js");
const Sales = require("../models/salesModel.js");
const Payments = require("../models/paymentsModel.js");
const {
  uploadOneImage,
  createUploadFolder,
  deleteUploadImage,
  preventDeletionIfUsed,
} = require("../middleware/helperMiddleware.js");
const path = require("path");
const customerDestination = path.join(
  path.dirname(__dirname),
  "./uploads/customers"
);
const multer = require("multer");
const CustomError = require("../config/CustomError");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");
const { default: mongoose } = require("mongoose");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
dayjs.extend(quarterOfYear);

// get next customer code
const getNextCustomerCode = asyncErorrHandeler(async (req, res, next) => {
  try {
    const lastCustomer = await Customer.findOne({}).sort({ code: -1 }).limit(1);
    if (lastCustomer !== null) {
      const nextCustomerCode = parseInt(lastCustomer.code) + 1;
      return res.status(200).json({ code: nextCustomerCode });
    } else {
      return res.status(200).json({ code: 1 });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});

//add new customer
const addCustomer = (req, res, next) => {
  try {
    //create customer upload supplier
    createUploadFolder(customerDestination);
    const uploadCustomerImage = uploadOneImage(customerDestination, "customer");
    let customerImage = "";
    let customerImagePath = "";
    uploadCustomerImage(req, res, async (err) => {
      const {
        code,
        name,
        ar_name,
        email,
        phone,
        bankAccount,
        vatNumber,
        commercialNo,
        country,
        city,
        district,
        street,
        address,
        ar_country,
        ar_city,
        ar_district,
        ar_street,
        ar_address,
        buildingNo,
        secondaryNo,
        postalCode,
        credit,
        debit,
        status,
      } = req.body;
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        // Everything went fine.
        if (req.file) {
          customerImage = `${process.env.URL}/customers/${req.file.filename}`;
          customerImagePath = `${customerDestination}/${req.file.filename}`;
        } else {
          customerImage = "";
        }
        //check if supplier is exsist
        const query = [];
        if (phone) query.push({ phone });
        if (bankAccount) query.push({ bankAccount });
        if (commercialNo) query.push({ commercialNo });
        if (email) query.push({ email });
        if (vatNumber) query.push({ vatNumber });
        if (name) query.push({ name });
        if (query.length > 0) {
          const exsistCustomer = await Customer.findOne({
            $or: query,
          }).exec();

          if (exsistCustomer) {
            if (req.file) {
              deleteUploadImage(customerImagePath);
            }
            if (name && exsistCustomer.name === name) {
              return next(
                new CustomError("This customer  name already exists", 400)
              );
            }
            if (phone && exsistCustomer.phone === phone) {
              return next(
                new CustomError(
                  "This customer phone number already exists",
                  400
                )
              );
            }
            if (commercialNo && exsistCustomer.commercialNo === commercialNo) {
              return next(
                new CustomError(
                  "This customer commercial number already exists",
                  400
                )
              );
            }
            if (vatNumber && exsistCustomer.vatNumber === vatNumber) {
              return next(
                new CustomError("This customer VAT number already exists", 400)
              );
            }
            if (email && exsistCustomer.email === email) {
              return next(
                new CustomError("This customer email already exists", 400)
              );
            }
            if (bankAccount && exsistCustomer.bankAccount === bankAccount) {
              return next(
                new CustomError(
                  "This customer bank account already exists",
                  400
                )
              );
            }
          }
        }
        // create new supplier
        const newCusteomer = await Customer.create({
          code:code.trim(),
          name:name.trim(),
          ar_name:ar_name.trim(),
          email:email.trim(),
          phone:phone.trim(),
          bankAccount:bankAccount.trim(),
          vatNumbe:vatNumber.trim(),
          commercialNo:commercialNo.trim(),
          country:country.trim(),
          city:city.trim(),
          district:district.trim(),
          street:street.trim(),
          address:address.trim(),
          ar_country:ar_country.trim(),
          ar_city:ar_city.trim(),
          ar_district:ar_district.trim(),
          ar_street:ar_street.trim(),
          ar_address:ar_address.trim(),
          buildingNo:buildingNo.trim(),
          secondaryNo:secondaryNo.trim(),
          postalCode:postalCode.trim(),
          credit: credit !== "" ? credit : 0,
          debit: debit !== "" ? debit : 0,
          image: customerImage,
          status,
        });
        if (newCusteomer !== null) {
          const _newCusteomer = await Customer.findOne({
            _id: newCusteomer._id,
          }).exec();
          return res.status(201).json({ customer: _newCusteomer });
        } else {
        }
      }
    });
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${customerDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};
// fetch one customer
const fetchOneCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id }).exec();
    if (customer != null) {
      return res.status(200).json({ customer });
    } else {
      return next(
        new CustomError(
          `No customer founded with this id ${req.params.id}`,
          400
        )
      );
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// fetch all customer
const fetchcustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).exec();
    if (customers.length > 0) {
      return res.status(200).json({ customers });
    } else {
      return res
        .status(404)
        .json({ customers: [], newCode: 1, msg: "No customer founded" });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//update customer
const updateCustomer = (req, res, next) => {
  try {
    //check customer  folder is exsist or created
    createUploadFolder(customerDestination);
    // upload supplier image
    const updatedUploadSupplierImage = uploadOneImage(
      customerDestination,
      "customer"
    );
    updatedUploadSupplierImage(req, res, async (err) => {
      const { id } = req.params;
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        // Everything went fine.
        //find category
        const cust = await Customer.findOne({ _id: id }).exec();
        let newCustomerImage = "";
        if (req.file) {
          newCustomerImage = `${process.env.URL}/customers/${req.file.filename}`;
        }
        if (cust) {
          if (cust.image !== "") {
            const oldCustomerImage = cust.image.split("/").pop();
            if (req.file) {
              // delete old image
              deleteUploadImage(`${customerDestination}/${oldCustomerImage}`);
            } else {
              newCustomerImage = cust.image;
            }
          }
          req.body.image = newCustomerImage;
          const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: id },
            {$set:req.body},
            { new: true, upsert: true }
          );
          return res.status(200).json({ customer: updatedCustomer });
        } else {
          // delete upload image
          if (req.file) {
            deleteUploadImage(`${customerDestination}/${req.file.filename}`);
          }
          return next(new CustomError("This customer is not exsist", 400));
        }
      }
    });
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${customerDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};
//delete many customer
const deleteManyCustomer = async (req, res, next) => {
  const { customersIds } = req.body;
  let deletedCustomers = [];
  try {
    if (customersIds.length === 0) {
      return next(new CustomError("No customer Selected", 400));
    } else {
      for (let i = 0; i < customersIds.length; i++) {
        const custId = customersIds[i];
        const customer = await Customer.findById(custId).exec();
        if (!customer) {
          return next(new CustomError(`This ${custId} is not exsist`, 400));
        }
        await preventDeletionIfUsed(customer, "customer");
        const deletedCust = await Customer.findOneAndDelete({
          _id: custId,
        }).exec();
        if (deletedCust) {
          if (deletedCust.image !== "") {
            deleteUploadImage(
              `${customerDestination}/${deletedCust.image.split("/").pop()}`
            );
          }
        } else {
          return next(new CustomError(`This ${cateId} is not exsist`, 400));
        }
        deletedCustomers = [...deletedCustomers, deletedCust];
      }
      if (customersIds.length === deletedCustomers.length) {
        return res
          .status(200)
          .json({ msg: "customers successful deleted", ids: customersIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
//delete one customer
const deleteOneCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).exec();
    if (!customer) {
      return next(new CustomError(`This ${req.params.id} is not exsist`, 400));
    }
    await preventDeletionIfUsed(customer, "customer");
    const deletedCustomer = await Customer.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    if (deletedCustomer) {
      if (deletedCustomer.image !== "") {
        deleteUploadImage(
          `${customerDestination}/${deletedCustomer.image.split("/").pop()}`
        );
      }
      return res.status(200).json({ id: deletedCustomer._id });
    } else {
      return next(new CustomError("This customer is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// get customer account
const getCustomerAccountStatement = async (req, res, next) => {
  try {
    const {
      customerId,
      year,
      month,
      quarter,
      startDate,
      endDate,
      code,
      phone,
    } = req.query;

    if (!customerId && !phone && !code) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one filter",
      });
    }

    let customerQuery = {};
    if (customerId !== "" && code === "" && phone === "") {
      customerQuery = { _id: customerId };
    } else if (customerId === "" && code !== "" && phone === "") {
      customerQuery = { code: code };
    } else if (customerId === "" && code === "" && phone !== "") {
      customerQuery = { phone: phone };
    }

    // bring customer record
    const customer = await Customer.findOne(customerQuery);
    if (!customer) {
      return res.status(404).json({
        success: false,
        msg: "Customer not found",
      });
    }

    // build filters
    let salesQuery = { customer: new mongoose.Types.ObjectId(customer._id) };
    let paymentsQuery = { partyId: new mongoose.Types.ObjectId(customer._id) };
    // filter by month
    if (year && month) {
      const m = String(month).padStart(2, "0");
      salesQuery.saleDate = { $regex: `^${year}/${m}` };
      paymentsQuery.paymentDate = { $regex: `^${year}/${m}` };
    }
    // filter by quarter
    if (year && quarter) {
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      const months = [];
      for (let m = startMonth; m <= endMonth; m++) {
        months.push(String(m).padStart(2, "0"));
      }
      salesQuery.saleDate = {
        $regex: `^${year}/(${months.join("|")})`,
      };
      paymentsQuery.paymentDate = salesQuery.saleDate;
    }
    if (startDate && endDate) {
      salesQuery.saleDate = { $gte: startDate, $lte: endDate };
      paymentsQuery.paymentDate = { $gte: startDate, $lte: endDate };
    }
    // get  unpaid sales invoices
    const unpaidSalesInvoices = await Sales.find({
      ...salesQuery,
      isSale: true,
      payment1: "credit",
      //  status: { $in: ["unpaid", "partial", "returned"] },
    }).select(
      "invoiceNumber netAmount paidAmount remainingAmount payments status saleDate"
    );
    // get unpaid sales return  invoices
    const unpaidReturnSalesInvoices = await Sales.find({
      ...salesQuery,
      isSale: false,
      payment1: "credit",
      // status: { $in: ["unpaid", "partial", "returned"] },
    }).select(
      "invoiceNumber netAmount paidAmount remainingAmount payments status saleDate"
    );
    // get all sales invoices
    const allSalesInvoices = await Sales.find({
      ...salesQuery,
    }).select(
      "invoiceNumber netAmount paidAmount remainingAmount payments status saleDate isSale"
    );
    const customerInvoices = allSalesInvoices.map((invoice) => ({
      ...invoice.toObject(),
      paidInvoice: invoice.paidAmount + invoice.payments,
      remaningInvoice:
        invoice.netAmount - (invoice.paidAmount + invoice.payments),
    }));
    // payments history
    const payments = await Payments.find(paymentsQuery).select(
      "code type amount paymentDate paymentMethode"
    );
    const paymentsAgg = await Payments.aggregate([
      { $match: paymentsQuery },
      {
        $group: {
          _id: "$partyId",
          totalPayments: { $sum: "$amount" },
        },
      },
    ]);
    //total payments
    const totalPayments =
      paymentsAgg.length > 0 ? paymentsAgg[0].totalPayments : 0;
    // total debit  unpaid invoices
    const debitFromInvoices =
      unpaidSalesInvoices.reduce((acc, s) => acc + s.remainingAmount, 0) || 0;
    const totalDebit = customer.debit + debitFromInvoices;
    // total credit unpaid return sales
    const creditFromInvoices =
      unpaidReturnSalesInvoices.reduce(
        (acc, s) => acc + s.remainingAmount,
        0
      ) || 0;
    // total credit
    const totalCredit = customer.credit + creditFromInvoices + totalPayments;
    //net account
    const netBalance = totalDebit - totalCredit;
    // --------- account Timeline) ---------
    let statement = [];
    // invoice Movements
    const invoiceMovements = customerInvoices.map((inv) => ({
      date: inv.saleDate,
      type: "invoice",
      invoiceType: inv.isSale, // true or false
      ref: inv.invoiceNumber,
      debit: inv.isSale === true ? inv.remainingAmount : 0, // sale
      credit: inv.isSale === false ? inv.remainingAmount : 0, // return
    }));
    // payments Movements
    const paymentMovements = payments.map((pay) => ({
      date: pay.paymentDate,
      type: "payment",
      invoiceType: "",
      ref: pay.code,
      debit: 0,
      credit: pay.amount,
    }));
    // merage invoices and payments
    statement = [...invoiceMovements, ...paymentMovements];
    // sort by date
    statement.sort((a, b) => (a.date > b.date ? 1 : -1));
    // final net account (Debit - Credit)
    let runningBalance = 0;
    statement = statement.map((s) => {
      runningBalance += s.debit - s.credit;
      return {
        ...s,
        balance: s.debit - s.credit,
      };
    });

    return res.status(200).json({
      data: {
        customer,
        totalDebit,
        totalCredit,
        netBalance: netBalance,
        invoices: customerInvoices,
        payments,
        statement,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  addCustomer,
  fetchOneCustomer,
  fetchcustomers,
  deleteManyCustomer,
  deleteOneCustomer,
  updateCustomer,
  getNextCustomerCode,
  getCustomerAccountStatement,
  //   getBrandPagination,
};
