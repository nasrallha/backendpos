const express = require("express");
const router = express.Router();
const {addNewPermission, deleteManyPermission, deleteOnePermission, updatePermission, fetchPermissions} = require("../controllers/permission.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");

//add page
router.post("/add", isAuth, isAuthorizedToCreate, addNewPermission);
//deletet permissions
router.post("/deleteMany", isAuth,isAuthorizedToDelete, deleteManyPermission);
// delete one permission
router.delete("/delete/:id", isAuth, isAuthorizedToDelete, deleteOnePermission);
//update permission
router.put("/update/:id", isAuth,isAuthorizedToUpdate, updatePermission);
//get all roles
router.get("/fetchAllPermissions",isAuth,fetchPermissions);
//get all fetch Permissions
// router.get("/fetchAllPermissions",isAuth,fetchPermissions);
// //get role Permissions
// router.get("/user",isAuth,getUserPermissions);
// //get one Permissions for row
// router.get("/rowPermission",isAuth,getPageRolePermissions);
// //update or create permission
// router.post("/update",isAuth,updatePermission);
// //update or create page  permission
// router.post("/update/pagePermissions",isAuth,upadetePagePermission);

module.exports = router;
