const Supplier = require("../models/supplierModel.js");
const Purchase = require("../models/purchasesModel.js");
const Payments = require("../models/paymentsModel.js");
const {
  uploadOneImage,
  createUploadFolder,
  deleteUploadImage,
  preventDeletionIfUsed,
} = require("../middleware/helperMiddleware.js");
const path = require("path");
const supplierDestination = path.join(
  path.dirname(__dirname),
  "./uploads/suppliers"
);
const multer = require("multer");
const CustomError = require("../config/CustomError");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");
const { default: mongoose } = require("mongoose");

// get next supplier code
const getNextSupplierCode = asyncErorrHandeler(async (req, res, next) => {
  // get next supplier code
  try {
    const lastSupplier = await Supplier.findOne({}).sort({ code: -1 }).limit(1);
    if (lastSupplier !== null) {
      const nextSupplierCode = parseInt(lastSupplier.code) + 1;
      return res.status(200).json({ code: nextSupplierCode });
    } else {
      return res.status(200).json({ code: 1 });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});

//add new supplier
const addSupplier = (req, res, next) => {
  try {
    //create supplier upload supplier
    createUploadFolder(supplierDestination);
    const uploadSupplierImage = uploadOneImage(supplierDestination, "supplier");
    let supplierImage = "";
    let supplierImagePath = "";
    uploadSupplierImage(req, res, async (err) => {
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
          supplierImage = `${process.env.URL}/suppliers/${req.file.filename}`;
          supplierImagePath = `${supplierDestination}/${req.file.filename}`;
        } else {
          supplierImage = "";
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
          const exsistSupplier = await Supplier.findOne({
            $or: query,
          }).exec();

          if (exsistSupplier) {
            if (req.file) {
              deleteUploadImage(supplierImagePath);
            }
            if (name && exsistSupplier.name === name) {
              return next(
                new CustomError("This supplier name already exists", 400)
              );
            }
            if (phone && exsistSupplier.phone === phone) {
              return next(
                new CustomError(
                  "This supplier phone number already exists",
                  400
                )
              );
            }
            if (commercialNo && exsistSupplier.commercialNo === commercialNo) {
              return next(
                new CustomError(
                  "This supplier commercial number already exists",
                  400
                )
              );
            }
            if (vatNumber && exsistSupplier.vatNumber === vatNumber) {
              return next(
                new CustomError("This supplier VAT number already exists", 400)
              );
            }
            if (email && exsistSupplier.email === email) {
              return next(
                new CustomError("This supplier email already exists", 400)
              );
            }
            if (bankAccount && exsistSupplier.bankAccount === bankAccount) {
              return next(
                new CustomError(
                  "This supplier bank account already exists",
                  400
                )
              );
            }
          }
        }
        // create new supplier
        const newSupplier = await Supplier.create({
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
          image: supplierImage,
          status,
        });
        if (newSupplier !== null) {
          const _newSupplier = await Supplier.findOne({
            _id: newSupplier._id,
          }).exec();
          return res.status(201).json({ supplier: _newSupplier });
        } else {
          return res.status(400).json({ msg: "some thing wronge!" });
        }
      }
    });
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${supplierDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};
// fetch one supplier
const fetchOneSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id }).exec();
    if (supplier != null) {
      return res.status(200).json({ supplier });
    } else {
      return next(
        new CustomError(
          `No Supplier founded with this id ${req.params.id}`,
          400
        )
      );
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// fetch all supplier
const fetchsuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({}).exec();
    if (suppliers.length > 0) {
      return res.status(200).json({ suppliers });
    } else {
      return res
        .status(404)
        .json({ suppliers: [], msg: "No suppliers founded" });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//update supplier
const updateSupplier = (req, res, next) => {
  try {
    //check supplier  folder is exsist or created
    createUploadFolder(supplierDestination);
    // upload supplier image
    const updatedUploadSupplierImage = uploadOneImage(
      supplierDestination,
      "supplier"
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
        const supp = await Supplier.findOne({ _id: id }).exec();
        let newSupplierImage = "";
        if (req.file) {
          newSupplierImage = `${process.env.URL}/suppliers/${req.file.filename}`;
        }
        if (supp) {
          if (supp.image !== "") {
            const oldSupplierImage = supp.image.split("/").pop();
            if (req.file) {
              // delete old image
              deleteUploadImage(`${supplierDestination}/${oldSupplierImage}`);
            } else {
              newSupplierImage = supp.image;
            }
          }
          req.body.image = newSupplierImage;
          const updatedSupplier = await Supplier.findOneAndUpdate(
            { _id: id },
            {$set:req.body},
            { new: true, upsert: true }
          );
          return res.status(200).json({ supplier: updatedSupplier });
        } else {
          // delete upload image
          if (req.file) {
            deleteUploadImage(`${supplierDestination}/${req.file.filename}`);
          }
          return next(new CustomError("This supplier is not exsist", 400));
        }
      }
    });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//delete many supplier
const deleteManySupplier = async (req, res, next) => {
  const { suppliersIds } = req.body;
  let deletedSuppliers = [];
  try {
    if (suppliersIds.length === 0) {
      return next(new CustomError("No supplier Selected", 400));
    } else {
      for (let i = 0; i < suppliersIds.length; i++) {
        const suppId = suppliersIds[i];
        const supplier = await Supplier.findById(suppId).exec();
        if (!supplier) {
          return next(new CustomError(`This ${suppId} is not exsist`, 400));
        }
        await preventDeletionIfUsed(supplier, "supplier");
        const deletedSupp = await Supplier.findOneAndDelete({
          _id: suppId,
        }).exec();
        if (deletedSupp) {
          if (deletedSupp.image !== "") {
            deleteUploadImage(
              `${supplierDestination}/${deletedSupp.image.split("/").pop()}`
            );
          }
        } else {
          return next(new CustomError(`This ${cateId} is not exsist`, 400));
        }
        deletedSuppliers = [...deletedSuppliers, deletedSupp];
      }
      if (suppliersIds.length === deletedSuppliers.length) {
        return res
          .status(200)
          .json({ msg: "suppliers successful deleted", ids: suppliersIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
//delete one supplier
const deleteOneSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id).exec();
    if (!supplier) {
      return next(new CustomError(`This ${req.params.id} is not exsist`, 400));
    }
    await preventDeletionIfUsed(supplier, "supplier");
    const deletedSupplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    if (deletedSupplier) {
      if (deletedSupplier.image !== "") {
        deleteUploadImage(
          `${supplierDestination}/${deletedSupplier.image.split("/").pop()}`
        );
      }
      return res.status(200).json({ id: deletedSupplier._id });
    } else {
      return next(new CustomError("This supplier is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// GET supplier account
const getSupplierAccountStatement = async (req, res, next) => {
  try {
    const {
      supplierId,
      year,
      month,
      quarter,
      startDate,
      endDate,
      code,
      phone,
    } = req.query;

    if (!supplierId && !phone && !code) {
      return res.status(400).json({
        success: false,
        msg: "Please select at least one filter",
      });
    }

    let supplierQuery = {};
    if (supplierId !== "" && code === "" && phone === "") {
      supplierQuery = { _id: supplierId };
    } else if (supplierId === "" && code !== "" && phone === "") {
      supplierQuery = { code: code };
    } else if (supplierId === "" && code === "" && phone !== "") {
      supplierQuery = { phone: phone };
    }

    // bring supplier record
    const supplier = await Supplier.findOne(supplierQuery);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        msg: "Supplier not found",
      });
    }

    // build filters
    let purchaseQuery = { supplier: new mongoose.Types.ObjectId(supplier._id) };
    let paymentsQuery = { partyId: new mongoose.Types.ObjectId(supplier._id) };

    // filter by month
    if (year && month) {
      const m = String(month).padStart(2, "0");
      purchaseQuery.purchaseDate = { $regex: `^${year}/${m}` };
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
      purchaseQuery.purchaseDate = {
        $regex: `^${year}/(${months.join("|")})`,
      };
      paymentsQuery.paymentDate = purchaseQuery.purchaseDate;
    }
    if (startDate && endDate) {
      purchaseQuery.purchaseDate = { $gte: startDate, $lte: endDate };
      paymentsQuery.paymentDate = { $gte: startDate, $lte: endDate };
    }
    // get unpaid purchase invoices
    const unpaidPurchaseInvoices = await Purchase.find({
      ...purchaseQuery,
      isPurchase: true,
      payment1: "credit",
      // status: { $in: ["unpaid", "partial"] },
    }).select(
      "invoiceNumber totalAmount paidAmount netAmount remainingAmount payments status purchaseDate isPurchase"
    );
    // get purchase return  invoices
    const unpaidReturnPurchaseInvoices = await Purchase.find({
      ...purchaseQuery,
      isPurchase: false,
      payment1: "credit",
      // status: { $in: ["unpaid", "partial", "returned"] },
    }).select(
      "invoiceNumber totalAmount netAmount paidAmount remainingAmount payments status purchaseDate isPurchase"
    );
    // get all purchase invoices
    const allPurchaseInvoices = await Purchase.find({
      ...purchaseQuery,
    }).select(
      "invoiceNumber totalAmount netAmount paidAmount remainingAmount payments status purchaseDate isPurchase"
    );
    const supplierInvoices = allPurchaseInvoices.map((invoice) => ({
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
      unpaidPurchaseInvoices.reduce((acc, s) => acc + s.remainingAmount, 0) ||
      0;
    const totalDebit = supplier.debit + debitFromInvoices;
    // total credit unpaid return sales
    const creditFromInvoices =
      unpaidReturnPurchaseInvoices.reduce(
        (acc, s) => acc + s.remainingAmount,
        0
      ) || 0;
    // total credit
    const totalCredit = supplier.credit + creditFromInvoices + totalPayments;
    //net account
    const netBalance = totalCredit - totalDebit;
    // --------- account Timeline) ---------
    let statement = [];
    // invoice Movements
    const invoiceMovements = supplierInvoices.map((inv) => ({
      date: inv.purchaseDate,
      type: "invoice",
      invoiceType: inv.isPurchase, // true or false
      ref: inv.invoiceNumber,
      debit: inv.isPurchase === true ? inv.remainingAmount : 0, // purchase
      credit: inv.isPurchase === false ? inv.remainingAmount : 0, // return
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
        balance: s.credit - s.debit,
      };
    });

    return res.status(200).json({
      data: {
        supplier,
        totalDebit,
        totalCredit,
        netBalance: netBalance,
        invoices: supplierInvoices,
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
  addSupplier,
  fetchOneSupplier,
  fetchsuppliers,
  deleteManySupplier,
  deleteOneSupplier,
  updateSupplier,
  getNextSupplierCode,
  getSupplierAccountStatement,
  //   getBrandPagination,
};
