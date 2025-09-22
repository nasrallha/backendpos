const express = require("express");
const router = express.Router();
const {getNextInvoice,addNewOrder, fetchOneOrder,returnOrder, fetchSaesReports} = require("../controllers/order.js");
const { isAuth } = require("../middleware/authMiddleware.js");

//get new invoice number
router.get("/nextInvoice", isAuth, getNextInvoice);
//add new order
router.post("/add", isAuth, addNewOrder);
// get one order By Invoice number
router.get("/fetchOne",isAuth,fetchOneOrder);
// get returned order
router.get("/return",isAuth,returnOrder);
// get sales reports 
router.get("/report",isAuth,fetchSaesReports);


module.exports = router;
