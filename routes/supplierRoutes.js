const express = require("express");
const router = express.Router();
const {
    addSupplier,
    fetchsuppliers,
    deleteOneSupplier,
    deleteManySupplier,
    updateSupplier,
    fetchOneSupplier,
    getNextSupplierCode,
    getSupplierAccountStatement
//   getBrandPagination
} = require("../controllers/supplier.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");

//get new supplier code
router.get("/supplierCode", isAuth, getNextSupplierCode);
//add supplier
router.post("/add", isAuth, isAuthorizedToCreate, addSupplier);
//fetch one supplier
router.get("/fetch/:id", isAuth, fetchOneSupplier);
//fetch suppliers
router.get("/fetchAllSupplier", isAuth, fetchsuppliers);
//deletet supplier
router.post("/delete", isAuth,isAuthorizedToDelete, deleteManySupplier);
//delete one supplier
router.delete("/remove/:id", isAuth,isAuthorizedToDelete, deleteOneSupplier);
//update supplier
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updateSupplier);
//get supplier account
router.get("/account", isAuth,getSupplierAccountStatement );
// //pagination brand
// router.get("/pagination", isAuth, getBrandPagination);

module.exports = router;
