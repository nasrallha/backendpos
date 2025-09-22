const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const { createNewPurchaseInvoice, getNextInvoiceNumber, getPurchaseInvoice,getPurchaseInvoiceToReturn,getReturnedPurchaseInvoice, getPurchasesReport } = require("../controllers/purchases.js");

//get new invoice number
router.get("/newInvoice", isAuth,getNextInvoiceNumber);
//add new invoice
router.post("/add", isAuth, createNewPurchaseInvoice);
// get one invoice By Invoice number
router.get("/",isAuth,getPurchaseInvoice);
// get returned purchases
router.get("/return",isAuth,getPurchaseInvoiceToReturn);
// get returned purchase invoice
router.get("/returned",isAuth,getReturnedPurchaseInvoice);



module.exports = router;
