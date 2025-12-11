const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const { getSalesReport } = require("../controllers/sales.js");
const { getPurchasesReport } = require("../controllers/purchases.js");
const { getInventoryReport, getTaxeport, getDailyReport, getBillsProfitReport, getNetProfit } = require("../controllers/report.js");
const { getEmployeeSalary } = require("../controllers/employee.js");


// get sales report
router.get("/sales",isAuth,getSalesReport);
// get purchase reports 
router.get("/purchase",isAuth,getPurchasesReport);
// get tax report
router.get("/tax",isAuth,getTaxeport);
// get stock report
router.get("/stock",isAuth,getInventoryReport);
// daily report
router.get("/daily",isAuth,getDailyReport);
// bills profit
router.get("/billsprofit",isAuth,getBillsProfitReport);
// get net profit
router.get("/netProfit",isAuth,getNetProfit);
// get employee salary
router.get("/employeesalary",isAuth,getEmployeeSalary);
module.exports = router;
