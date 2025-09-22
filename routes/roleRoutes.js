const express = require("express");
const router = express.Router();
const {
  addNewRole,
  fetchRoles,
  deleteOneRole,
  deleteManyRoles,
  updateRole,
  getRole
} = require("../controllers/role.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");
//add role
router.post("/add", isAuth, addNewRole);
//deletet roles
router.post("/deleteRoles", isAuth,isAuthorizedToCreate, deleteManyRoles);
// delete onr role
router.delete("/delete/:id", isAuth,isAuthorizedToDelete, deleteOneRole);
//update role
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updateRole);
//get all roles
router.get("/fetchAllRoles",isAuth,fetchRoles);
//get one role
router.get("/fetchRole/:id",isAuth,getRole);


module.exports = router;
