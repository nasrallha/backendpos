const express = require("express");
const router = express.Router();
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");
const { addNewVoucher, deleteManyVoucher, deleteOneVoucher, updateVoucher, fetchVouchers, getNextVoucherNumber } = require("../controllers/voucher.js");

//get new payment code
router.get("/number", isAuth, getNextVoucherNumber);
//add voucher
router.post("/add", isAuth, addNewVoucher);
//deletet vouchsers
router.post("/deleteVouchers", isAuth,isAuthorizedToCreate, deleteManyVoucher);
// delete onr voucher
router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deleteOneVoucher);
//update voucher
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updateVoucher);
//get all vouchsers
router.get("/fetch",isAuth,fetchVouchers);



module.exports = router;
