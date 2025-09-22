const express = require("express");
const router = express.Router();
const { uploadUserAvatar, fetchUsers, deleteManyUsers, deleteOnUser, updateUser } = require("../controllers/user.js");
const { isAuth, isAuthorizedToUpdate, isAuthorizedToDelete } = require("../middleware/authMiddleware.js");
const { addPermissionsToUser, getUserPermissions, getAuthPermissions } = require("../controllers/userPermissions.js");


// uplaode user avatar
router.post("/uploadAvatar",isAuth,isAuthorizedToUpdate, uploadUserAvatar);
router.get("/fetchAllUsers",isAuth,fetchUsers);
// delete many users
router.post("/deleteUsers", isAuth, isAuthorizedToDelete, deleteManyUsers);
//delete one user
router.delete("/delete/:id", isAuth, isAuthorizedToDelete, deleteOnUser);
//update user
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updateUser);
//add user permissions
router.post("/addpermissions", isAuth, addPermissionsToUser);
//get user permissions
router.get("/fetchUserPermissions", isAuth, getUserPermissions);
//get user authPermissions
router.get("/authPermissions", isAuth, getAuthPermissions);
module.exports = router;
