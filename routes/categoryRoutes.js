const express = require("express");
const router = express.Router();
const {
  addCategory,
  updateCategory,
  deleteManyCategories,
  fetchCategories,
  deleteOneCategory,
  // filterCategory,
} = require("../controllers/category.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToUpdate, isAuthorizedToDelete } = require("../middleware/authMiddleware.js");

//add category
router.post("/add", isAuth,isAuthorizedToCreate, addCategory);
//update category
router.put("/update/:id", isAuth,isAuthorizedToUpdate, updateCategory);
//deletet one category
 router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deleteOneCategory);
 //deletet many categories
 router.post("/delete", isAuth,isAuthorizedToDelete, deleteManyCategories);
//fetch categorires
 router.get("/fetchAllCategories", isAuth, fetchCategories);
// //filter category
// router.get("/filter", isAuth, filterCategory);

module.exports = router;
