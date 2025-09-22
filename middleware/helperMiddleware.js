const jwt = require("jsonwebtoken");
const jwtPrivateKey = process.env.JWT_SCREET;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CustomError = require("../config/CustomError");
const Products = require("../models/productModel");
const Sales = require("../models/salesModel");
const Purchases = require("../models/purchasesModel");

// create token
const createToken = (user, exp) => {
  const token = jwt.sign({ id: user._id, role: user.role }, jwtPrivateKey, {
    expiresIn: exp,
  });
  return token;
};
// uplod one image
const uploadOneImage = (destination, fieldname) => {
  const storage = multer.diskStorage({
    // place for store image to desktop
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Math.round(Math.random() * 1000);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB 1 * 1024 * 1024
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
      }
    },
  }).single(fieldname);
  return upload;
};
// upload many images
const uploadImages = (destination, fieldname) => {
  const storage = multer.diskStorage({
    // place for store image
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Math.round(Math.random() * 1000);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB 1 * 1024 * 1024
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
      }
    },
  }).array(fieldname);
  return upload;
};
//create upload folder
const createUploadFolder = (destination) => {
  if (fs.existsSync(destination)) {
    //console.log('This file is already exsist !')
    return true;
  } else {
    //create folder
    fs.mkdirSync(destination);
  }
};
//delelet new upload image
const deleteUploadImage = (destination) => {
  fs.unlink(destination, (err) => {
    if (err) {
      // throw err
      return new CustomError(`This Path ${destination} not founded`, 400);
    }
  });
};
const getNexCode = async (model) => {
  const lastCode = await model.findOne({}).sort({ code: -1 }).limit(1);
  const nextCode = parseInt(lastCode.code) + 1;
  return nextCode;
};

const roundNumber = (num, decimalPlaces = 2) => {
  num = Math.round(num + "e" + decimalPlaces);
  return Number(num + "e" + -decimalPlaces);
};
const roundIntger = (num) => {
  const intPart = Math.trunc(num);
  const decimalPart = Number(Number(num) - intPart).toFixed(2);
  if (decimalPart >= 0.6 && decimalPart !== 0) {
    return Math.round(Number(num));
  } else {
    return Number(num);
  }
};
const formatCurrentDate = () => {
  const currentDate = new Date();
  let d = currentDate.getDate();
  let m = currentDate.getMonth() + 1;
  let y = currentDate.getFullYear();
  let date = `${y}-${m < 10 ? "0" + m : m}-${d < 10 ? "0" + d : d}`;

  return date;
};

const preventDeletionIfUsed = async (doc, type) => {
  if (!doc) return;

  switch (type) {
    case "product": {
      const usedInSales = await Sales.findOne({ "items.productId": doc._id });
      const usedInPurchases = await Purchases.findOne({
        "items.productId": doc._id,
      });
      if (usedInSales || usedInPurchases) {
        throw "لا يمكن حذف هذا الصنف لأنه مستخدم في فاتورة / Cannot delete this product because it is used in an invoice.";
      }
      break;
    }

    case "customer": {
      const usedInSales = await Sales.findOne({ customer: doc._id });
      if (usedInSales) {
        throw "لا يمكن حذف هذا العميل لأنه مستخدم في فاتورة بيع  / Cannot delete this customer because it is used in a sales invoice.";
      }
      break;
    }

    case "user": {
      const usedInSales = await Sales.findOne({ createdBy: doc._id });
      const usedInPurchases = await Purchases.findOne({ createdBy: doc._id });
      if (usedInSales || usedInPurchases) {
        throw "لا يمكن حذف هذا المستخدم لأنه مستخدم في فاتورة. / Cannot delete this user because it is used in an invoice.";
      }
      break;
    }

    case "supplier": {
      const usedInPurchases = await Purchases.findOne({ supplier: doc._id });
      if (usedInPurchases) {
        throw "لا يمكن حذف هذا المورد لأنه مستخدم في فاتورة شراء. / Cannot delete this supplier because it is used in a purchase invoice.";
      }
      break;
    }

    case "category": {
      const usedProducts = await Products.findOne({ category: doc._id });
      const usedSales = await Sales.findOne({ "items.categoryId": doc._id });
      const usedPurchase = await Purchases.findOne({
        "items.categoryId": doc._id,
      });
      if (usedProducts || usedSales || usedPurchase) {
        throw "لا يمكن حذف هذه الفئة لأنها مرتبطة بأصناف. / Cannot delete this category because it is linked with products.";
      }
      break;
    }

    case "brand": {
      const usedProducts = await Products.findOne({ brand: doc._id });
      const usedSales = await Sales.findOne({ "items.brandId": doc._id });
      const usedPurchase = await Purchases.findOne({
        "items.brandId": doc._id,
      });
      if (usedProducts || usedSales || usedPurchase) {
        throw "لا يمكن حذف هذا البراند لأنه مرتبط بأصناف. / Cannot delete this brand because it is linked with products.";
      }
      break;
    }

    case "unit": {
      const usedProducts = await Products.findOne({ baseUnit: doc._id });
      const usedSales = await Sales.findOne({ "items.unitId": doc._id });
      const usedPurchase = await Purchases.findOne({ "items.unitId": doc._id });
      if (usedProducts || usedSales || usedPurchase) {
        throw "لا يمكن حذف هذه الوحدة لأنها مرتبطة بأصناف. / Cannot delete this unit because it is linked with products.";
      }
      break;
    }
  }
};

module.exports = {
  createToken,
  uploadOneImage,
  uploadImages,
  createUploadFolder,
  deleteUploadImage,
  getNexCode,
  roundIntger,
  roundNumber,
  formatCurrentDate,
  preventDeletionIfUsed,
};
