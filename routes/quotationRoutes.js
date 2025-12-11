const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const { getNextQuotationNumber, createNewQuotation, getQuotation, getQuotations, updateQuotation, deleteQuotation } = require("../controllers/quotation.js");

//get new quotation number
router.get("/newquotation", isAuth, getNextQuotationNumber);
//add new quotation
router.post("/add", isAuth, createNewQuotation);
// get one quotation
router.get("/oneQuotation",isAuth,getQuotation);
// get all quotation
router.get("/all",isAuth,getQuotations);
// update quotation
router.put("/update/:id",isAuth,updateQuotation);
// delete quotation
router.delete("/delete/:id",isAuth,deleteQuotation);



module.exports = router;
