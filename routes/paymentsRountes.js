const express = require("express");
const router = express.Router();
const { isAuth, isAuthorizedToDelete, isAuthorizedToUpdate, isAuthorizedToCreate } = require("../middleware/authMiddleware.js");
const {addNewPayment, getNextPaymentCode, deletePayment, updatePayment, fetchPayments } = require("../controllers/payments.js");

//get new payment code
router.get("/code", isAuth, getNextPaymentCode);
// add payments 
router.post("/add",isAuth,isAuthorizedToCreate,addNewPayment);
// // get credit invoices 
// router.get("/invoices",isAuth,getCreditInvoices);
// get payments  
router.get("/fetchAll",isAuth,fetchPayments);
// delete one payment
router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deletePayment);
//update payment
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updatePayment);

module.exports = router;
