const express = require("express");
const router = express.Router();
const {
  addNewBrand,
  fetchBrands,
  deleteOnBrand,
  deleteManyBrands,
  updateBrand,
  getBrand
} = require("../controllers/brand.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");

//add brand
router.post("/add", isAuth,isAuthorizedToCreate, addNewBrand);
//deletet brands
router.post("/deleteBrands", isAuth,isAuthorizedToDelete, deleteManyBrands);
//delete one brand
router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deleteOnBrand);
//update brand
router.put("/update/:id", isAuth,isAuthorizedToUpdate, updateBrand);
//get all brands
router.get("/fetchAllBrands",isAuth,fetchBrands);
//get one brand
router.get("/fetchBrand/:id",isAuth,getBrand);

module.exports = router;
