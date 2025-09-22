const express = require("express");
const router = express.Router();

const { isAuth } = require("../middleware/authMiddleware.js");
const { printCashier } = require("../controllers/print.js");
//cashier print
router.post("/", isAuth, printCashier);



module.exports = router;
