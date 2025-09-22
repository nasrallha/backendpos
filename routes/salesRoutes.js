const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const { createNewSalesInvoice, getNextInvoiceNumber, getSalesInvoice,getSalesInvoiceToReturn,getReturnedSalesInvoice, getSalesReport } = require("../controllers/sales.js");

//get new invoice number
router.get("/newInvoice", isAuth, getNextInvoiceNumber);
//add new invoice
router.post("/add", isAuth, createNewSalesInvoice);
// get one invoice By Invoice number
router.get("/",isAuth,getSalesInvoice);
// get returned sales
router.get("/return",isAuth,getSalesInvoiceToReturn);
// get returned sales invoice
router.get("/returned",isAuth,getReturnedSalesInvoice);



module.exports = router;
