const express = require("express");
const router = express.Router();
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");
const { addNeDiscount, deleteManyDiscount, deleteOneDiscount, updatDiscount, fetchDiscounts } = require("../controllers/discount.js");
//add discount
router.post("/add", isAuth, addNeDiscount);
//deletet discounts
router.post("/deleteDiscounts", isAuth,isAuthorizedToCreate, deleteManyDiscount);
// delete one discount
router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deleteOneDiscount);
//update update
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updatDiscount);
//get all discounts
router.get("/fetchAllDiscounts",isAuth,fetchDiscounts);


module.exports = router;
