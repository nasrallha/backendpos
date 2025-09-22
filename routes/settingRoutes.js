const express = require("express");
const router = express.Router();
const { isAuth, isAuthorizedToCreate, isAuthorizedToUpdate } = require("../middleware/authMiddleware.js");
const { fetchCompanySetting, addCompanySetting, updateCompanyData } = require("../controllers/setting.js");


//get  setting
router.get("/fetchSetting",isAuth,fetchCompanySetting);
//add or update setting
router.post("/addSetting",isAuth, isAuthorizedToCreate, addCompanySetting);
//update compant data
router.put("/update/:id", isAuth,isAuthorizedToUpdate, updateCompanyData)


module.exports = router;
