const express = require("express");
const router = express.Router();
const { isAuth, isAuthorizedToCreate, isAuthorizedToUpdate, isAuthorizedToDelete } = require("../middleware/authMiddleware.js");
const {
  addNewProduct,
  fetchProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  deleteProducts,
  getProductStock
} = require("../controllers/product.js");

//create new product
router.post("/addproduct", isAuth,isAuthorizedToCreate, addNewProduct);
// get products
router.get("/fetchProducts", isAuth, fetchProducts);
//get product stock
router.get("/stock", getProductStock);
// get product
router.get("/:id", isAuth, getProduct);
//update  product
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updateProduct);
//delete one product
router.delete("/delete/:id", isAuth, isAuthorizedToDelete, deleteProduct);
//delete  products
router.post("/delete", isAuth, deleteProducts);


module.exports = router;
