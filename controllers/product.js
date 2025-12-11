const Product = require("../models/productModel");
const Sales = require("../models/salesModel.js");
const Purchases = require("../models/purchasesModel.js");
const Discount = require("../models/discountModel.js");
const path = require("path");
const productDestination = path.join(
  path.dirname(__dirname),
  "./uploads/products"
);
const multer = require("multer");
const {
  createUploadFolder,
  uploadImages,
  deleteUploadImage,
  formatCurrentDate,
  preventDeletionIfUsed,
} = require("../middleware/helperMiddleware");
const CustomError = require("../config/CustomError");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler");
const { default: mongoose } = require("mongoose");

// get next product code
const getNextProductCode = asyncErorrHandeler(async (req, res, next) => {
  try {
    const lastProductCode = await Product.findOne({barcode: { $regex: /^[0-9]+$/ }}).sort({ barcode: -1 }).limit(1);
    if (lastProductCode !== null) {
      const nextProductCode = parseInt(lastProductCode.barcode) + 1;
      return res.status(200).json({ code: nextProductCode });
    } else {
      return res.status(200).json({ code: 1 });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
// applyDiscounts.js
const applyDiscountsToProduct = (product, discounts) => {
  const now = formatCurrentDate();
  for (const discount of discounts) {
    if (now >= discount.startDate && now <= discount.endDate) {
      if (
        (discount.appliesTo.type === "category" &&
          discount.appliesTo.items.includes(product.category._id)) ||
        (discount.appliesTo.type === "product" &&
          discount.appliesTo.items.includes(product._id))
      ) {
        if (discount.discountType === "percentage") {
          product.discountPrice = product.price * (1 - discount.value / 100);
        } else {
          product.discountPrice = product.price - discount.value;
        }
        break;
      }
    }
  }
  return product;
};
// product stock
const getProductStockHelper = async (productId) => {
  const product = await Product.findById(productId).exec();
  if (!product) return null;

  const productFirstStock = product.startStock || 0;

  const salesQty = await Sales.aggregate([
    { $match: { "items.productId": product._id, isSale: true } },
    { $unwind: "$items" },
    { $match: { "items.productId": product._id } },
    { $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } } },
  ]);

  const rSalesQty = await Sales.aggregate([
    { $match: { "items.productId": product._id, isSale: false } },
    { $unwind: "$items" },
    { $match: { "items.productId": product._id } },
    { $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } } },
  ]);

  const purchasesQty = await Purchases.aggregate([
    { $match: { "items.productId": product._id, isPurchase: true } },
    { $unwind: "$items" },
    { $match: { "items.productId": product._id } },
    { $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } } },
  ]);

  const rPurchasesQty = await Purchases.aggregate([
    { $match: { "items.productId": product._id, isPurchase: false } },
    { $unwind: "$items" },
    { $match: { "items.productId": product._id } },
    { $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } } },
  ]);

  const stock = {
    salesQty: salesQty.length > 0 ? salesQty[0].total : 0,
    rSalesQty: rSalesQty.length > 0 ? rSalesQty[0].total : 0,
    purchasesQty: purchasesQty.length > 0 ? purchasesQty[0].total : 0,
    rPurchasesQty: rPurchasesQty.length > 0 ? rPurchasesQty[0].total : 0,
  };

  const netStock =
    productFirstStock +
    stock.rSalesQty +
    stock.purchasesQty -
    (stock.salesQty + stock.rPurchasesQty);

  return { ...stock, firstStock: productFirstStock, netStock };
};

// crate new product
const addNewProduct = (req, res, next) => {
  // create folder to upload product image
  try {
    createUploadFolder(productDestination);
    const uploadProductImages = uploadImages(
      productDestination,
      "productImage"
    );
    uploadProductImages(req, res, async (err) => {
      const {
        barcode,
        name,
        ar_name,
        brand,
        category,
        baseUnit,
        price,
        cost,
        wholesalePrice,
        startStock,
        taxRate,
        priceIncludeTax,
        costIncludeTax,
        status,
        colors,
        clothingSize,
        shoeSize,
        description,
        ar_description,
        unitCount,
        baseItem,
        limit,
        createdDate,
        createdTime,
      } = req.body;
      const productColors = JSON.parse(colors).map((c) => JSON.parse(c));
      const _clothingSize = JSON.parse(clothingSize);
      const _shoeSize = JSON.parse(shoeSize);
      // check error
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        // Everything went fine.
        if (req.files) {
          productImages = req.files.map((file) => {
            return {
              image: `${process.env.URL}/products/${file.filename}`,
            };
          });
        } else {
          productImages = [];
        }
        const exsistProduct = await Product.findOne({
          $or: [{ name }, { barcode }],
        }).exec();
        //check if product is exsist
        if (exsistProduct) {
          if (req.files) {
            req.files.map((file) => {
              deleteUploadImage(`${productDestination}/${file.filename}`);
            });
          }
          return next(new CustomError("This product is already exsist", 400));
        }
        // check code orname or ar_name or category ,cost ,price for product
        if (!name || !ar_name || !category) {
          if (req.files) {
            req.files.map((file) => {
              deleteUploadImage(`${productDestination}/${file.filename}`);
            });
          }
          return next(
            new CustomError(
              "code ,name, ar_name ,category, cost ,price are required",
              400
            )
          );
        }
        // create new products
        const newProduct = await Product.create({
          barcode,
          name,
          ar_name,
          brand: brand !== "" ? brand : null,
          category,
          baseUnit: baseUnit !== "" ? baseUnit : null,
          cost,
          price,
          wholesalePrice,
          taxRate,
          priceIncludeTax,
          costIncludeTax,
          status,
          productImages,
          colors: productColors,
          clothingSize: _clothingSize,
          shoeSize: _shoeSize,
          description,
          ar_description,
          unitCount,
          baseItem,
          createdDate,
          createdTime,
          startStock: startStock,
          limit,
        });
        if (newProduct !== null) {
          const _newNeProduct = await Product.findOne({ _id: newProduct._id })
            .populate({ path: "category", select: "_id name ar_name" })
            .populate({ path: "brand", select: "_id name ar_name" })
            .populate({ path: "baseUnit", select: "_id name ar_name" });
          const stock = await getProductStockHelper(_newNeProduct._id);
          return res.status(201).json({
            product: {
              ..._newNeProduct.toObject(),
              stock,
            },
          });
        } else {
          return next(new CustomError("some thing wronge!", 400));
        }
      }
    });
  } catch (error) {
    if (req.files) {
      req.files.map((file) => {
        deleteUploadImage(`${productDestination}/${file.filename}`);
      });
    }
    return next(new CustomError(error.message, 400));
  }
};
//get all peoducts

const fetchProducts = async (req, res, next) => {
  try {
    const discounts = await Discount.find({ active: true }).exec();

    const temProducts = await Product.find({})
      .populate({ path: "category", select: "_id name ar_name" })
      .populate({ path: "brand", select: "_id name ar_name" })
      .populate({ path: "baseUnit", select: "_id name ar_name" })
      .exec();

    if (temProducts.length === 0) {
      return res.status(404).json({ products: [], msg: "No Products Exsist" });
    }

    const productsWithStock = await Promise.all(
      temProducts.map(async (product) => {
        const stock = await getProductStockHelper(product._id);
        const productWithDiscount = applyDiscountsToProduct(product, discounts);
        return {
          ...productWithDiscount.toObject(),
          stock,
        };
      })
    );
    return res.status(200).json({ products: productsWithStock });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//get one peoduct
const getProduct = asyncErorrHandeler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id })
      .populate({ path: "category", select: "_id name ar_name" })
      .populate({ path: "brand", select: "_id name ar_name" })
      .populate({ path: "baseUnit", select: "_id name ar_name" })
      .exec();
    if (product) {
      // console.log(product)
      return res.status(200).json({ product });
    } else {
      return next(new CustomError("No product Exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
// update product
const updateProduct = async (req, res, next) => {
  try {
    //create product upload brand
    createUploadFolder(productDestination);
    const uploadProductImages = uploadImages(
      productDestination,
      "productImage"
    );
    uploadProductImages(req, res, async (err) => {
      const { id } = req.params;
      let Pimages = [];
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        //Everything went fine.
        //find product
        const product = await Product.findOne({ _id: id }).exec();
        if (product) {
          if (product.productImages.length > 0) {
            if (req.files.length > 0) {
              // delete old product images from client
              product.productImages.map((pIm) => {
                deleteUploadImage(
                  `${productDestination}/${pIm.image.split("/").pop()}`
                );
              });
              Pimages = req.files.map((file) => {
                return {
                  image: `${process.env.URL}/products/${file.filename}`,
                };
              });
            } else {
              //  Pimages = product.productImages.map((pImg)=>{return {image:pImg.image}});
              product.productImages.forEach(({ image }) => {
                if (req.body.productImage.includes(image)) {
                  Pimages.push({ image });
                } else {
                  deleteUploadImage(
                    `${productDestination}/${image.split("/").pop()}`
                  );
                }
              });
            }
          } else {
            if (req.files.length > 0) {
              Pimages = req.files.map((file) => {
                return {
                  image: `${process.env.URL}/products/${file.filename}`,
                };
              });
            }
          }
          const { colors, clothingSize, shoeSize } = req.body;
          const productColors = JSON.parse(colors).map((c) => JSON.parse(c));
          const _clothingSize = JSON.parse(clothingSize);
          const _shoeSize = JSON.parse(shoeSize);
          req.body.productImages = Pimages;
          req.body.colors = productColors;
          req.body.clothingSize = _clothingSize;
          req.body.shoeSize = _shoeSize;
          req.body.brand = req.body.brand ? req.body.brand : null;
          req.body.baseUnit = req.body.baseUnit ? req.body.baseUnit : null;

          const updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            req.body,
            { new: true, upsert: true }
          )
            .populate({ path: "category", select: "_id name ar_name" })
            .populate({ path: "brand", select: "_id name ar_name" })
            .populate({ path: "baseUnit", select: "_id name ar_name" });
          const stock = await getProductStockHelper(updatedProduct._id);
          return res.status(200).json({
            product: {
              ...updatedProduct.toObject(),
              stock,
            },
          });
        } else {
          // delete upload images
          if (req.files) {
            req.files.map((file) => {
              deleteUploadImage(`${productDestination}/${file.filename}`);
            });
          }
          return next(new CustomError("This product is not exsist", 400));
        }
      }
    });
  } catch (error) {
    if (req.files) {
      req.files.map((file) => {
        deleteUploadImage(`${productDestination}/${file.filename}`);
      });
    }
    return next(new CustomError(error, 400));
  }
};
// delete one product
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).exec();
    if (!product) {
      return next(new CustomError(`This ${req.params.id} is not exsist`, 400));
    }
    await preventDeletionIfUsed(product, "product");
    const deletedProduct = await Product.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    if (deletedProduct) {
      if (deletedProduct.productImages.length > 0) {
        deletedProduct.productImages.map((p) => {
          deleteUploadImage(
            `${productDestination}/${p.image.split("/").pop()}`
          );
        });
      }
      return res.status(200).json({ id: deletedProduct._id });
    } else {
      return next(new CustomError("This product is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// delete products
const deleteProducts = async (req, res, next) => {
  const { productsIds } = req.body;
  let deletedProducts = [];
  try {
    if (productsIds.length === 0) {
      return next(new CustomError("No product Selected", 400));
    } else {
      for (let i = 0; i < productsIds.length; i++) {
        const pId = productsIds[i];
        const product = await Product.findById(pId).exec();
        if (!product) {
          return next(new CustomError(`This ${pId} is not exsist`, 400));
        }
        await preventDeletionIfUsed(product, "product");

        const deletedProduct = await Product.findOneAndDelete({
          _id: pId,
        }).exec();
        if (deletedProduct) {
          if (deletedProduct.productImages.length > 0) {
            // delete product images from client
            deletedProduct.productImages.map((pIm) => {
              deleteUploadImage(
                `${productDestination}/${pIm.image.split("/").pop()}`
              );
            });
          }
        } else {
          return next(new CustomError(`This ${pId} is not exsist`, 400));
        }
        deletedProducts = [...deletedProducts, deletedProduct];
      }
      if (productsIds.length === deletedProducts.length) {
        return res
          .status(200)
          .json({ msg: "Products successful deleted", ids: productsIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// get product stock

const getProductStock = async (req, res, next) => {
  const { productId } = req.query;

  try {
    if (!productId) {
      return next(new CustomError("No product sending", 400));
    }

    // get product first stock from products
    const product = await Product.findById(productId).exec();
    if (!product) {
      return next(new CustomError("No product Exsist", 400));
    }

    const productFirstStock = product.startStock || 0;

    // get product sales
    const salesQty = await Sales.aggregate([
      { $match: { "items.productId": product._id, isSale: true } },
      { $unwind: "$items" },
      { $match: { "items.productId": product._id } },
      {
        $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } },
      },
    ]);

    // get product return sales
    const rSalesQty = await Sales.aggregate([
      { $match: { "items.productId": product._id, isSale: false } },
      { $unwind: "$items" },
      { $match: { "items.productId": product._id } },
      {
        $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } },
      },
    ]);

    // get product purchases
    const purchasesQty = await Purchases.aggregate([
      { $match: { "items.productId": product._id, isPurchase: true } },
      { $unwind: "$items" },
      { $match: { "items.productId": product._id } },
      {
        $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } },
      },
    ]);

    // get product return purchases
    const rPurchasesQty = await Purchases.aggregate([
      { $match: { "items.productId": product._id, isPurchase: false } },
      { $unwind: "$items" },
      { $match: { "items.productId": product._id } },
      {
        $group: { _id: "$items.productId", total: { $sum: "$items.quantity" } },
      },
    ]);

    const stock = {
      salesQty: salesQty.length > 0 ? salesQty[0].total : 0,
      rSalesQty: rSalesQty.length > 0 ? rSalesQty[0].total : 0,
      purchasesQty: purchasesQty.length > 0 ? purchasesQty[0].total : 0,
      rPurchasesQty: rPurchasesQty.length > 0 ? rPurchasesQty[0].total : 0,
    };

    const netStock =
      productFirstStock +
      stock.rSalesQty +
      stock.purchasesQty -
      (stock.salesQty + stock.rPurchasesQty);

    return res.status(200).json({
      stock: {
        firstStock: productFirstStock,
        ...stock,
        netStock,
      },
    });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
module.exports = {
  addNewProduct,
  fetchProducts,
  getNextProductCode,
  getProduct,
  updateProduct,
  deleteProduct,
  deleteProducts,
  getProductStock,
};
