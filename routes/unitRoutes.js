const express = require("express");
const router = express.Router();
const {
  addNewUnit,
  fetchUnits,
  deleteOneUnit,
  deleteManyUnits,
  updateUnit,
} = require("../controllers/unit.js");
const { isAuth, isAuthorizedToCreate, isAuthorizedToDelete, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");

//add unit
router.post("/add", isAuth,isAuthorizedToCreate, addNewUnit);
//deletet units
router.post("/deleteUnits", isAuth,isAuthorizedToDelete, deleteManyUnits);
// delete one unit
router.delete("/delete/:id", isAuth, deleteOneUnit);
//update unit
router.put("/update/:id", isAuth,isAuthorizedToUpdate, updateUnit);
//get all units
router.get("/fetchAllUnits",isAuth,fetchUnits);


module.exports = router;
