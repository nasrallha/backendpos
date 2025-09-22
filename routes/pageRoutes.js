const express = require("express");
const router = express.Router();
const {
  addNewPage,
  fetchPages,
  fetchNavberPages,
  deleteOnePage,
  deleteManyPages,
  updatePage,
  getPage
} = require("../controllers/page.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");

//add page
router.post("/add", isAuth,isAuthorizedToCreate, addNewPage);
//deletet pages
router.post("/deletePages", isAuth,isAuthorizedToDelete, deleteManyPages);
// delete onr page
router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deleteOnePage);
//update page
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updatePage);
//get all pages
router.get("/fetchAllPages",isAuth,fetchPages);
//get navber pages
router.get("/fetchAllNavberPages",isAuth,fetchNavberPages);
//get one page
router.get("/fetchRole/:id",isAuth,getPage);


module.exports = router;
