const express = require("express");
const router = express.Router();
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");
const { addNewBranch, deleteManyBranches, deleteOneBranch, updateBranch, fetchBranches } = require("../controllers/branch.js");
//add branch
router.post("/add", isAuth, addNewBranch);
//deletet branches
router.post("/deleteBranches", isAuth,isAuthorizedToCreate, deleteManyBranches);
// delete one branch
router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deleteOneBranch);
//update branch
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updateBranch);
//get all branches
router.get("/fetchAllBranches",isAuth,fetchBranches);



module.exports = router;
