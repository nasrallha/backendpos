const express = require("express");
const router = express.Router();
const {
    addCustomer,
    fetchOneCustomer,
    fetchcustomers,
    deleteManyCustomer,
    deleteOneCustomer,
    updateCustomer,
    getNextCustomerCode,
    getCustomerAccountStatement,
//   getBrandPagination
} = require("../controllers/customer.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");

//get new customer code
router.get("/customerCode", isAuth, getNextCustomerCode);
//add customer
router.post("/add", isAuth,isAuthorizedToCreate, addCustomer);
//fetch one customer
router.get("/fetch/:id", isAuth, fetchOneCustomer);
//fetch customer
router.get("/fetchAllCustomer", isAuth, fetchcustomers);
//deletet customer
router.post("/delete", isAuth,isAuthorizedToDelete, deleteManyCustomer);
//delete one customer
router.delete("/:id", isAuth,isAuthorizedToDelete, deleteOneCustomer);
//update customer
router.put("/update/:id", isAuth,isAuthorizedToUpdate, updateCustomer);
//get customer account
router.get("/account", isAuth,getCustomerAccountStatement );
// //pagination brand
// router.get("/pagination", isAuth, getBrandPagination);

module.exports = router;
