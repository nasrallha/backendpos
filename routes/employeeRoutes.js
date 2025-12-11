const express = require("express");
const router = express.Router();
const {
  isAuth,
  isAuthorizedToCreate,
  isAuthorizedToDelete,
  isAuthorizedToUpdate,
} = require("../middleware/authMiddleware.js");
const {
  getNextEmployeeCode,
  addEmployee,
  fetchOneEmployee,
  fetchEmployees,
  deleteManyEmployee,
  deleteOneEmployee,
  updateEmployee,
  getNextTransactionCode,
  addEmpTransaction,
  fetchTransactions,
  updateEmpTransaction,
  deleteOneEmpTransaction,
  deleteManyEmpTransactions
} = require("../controllers/employee.js");

//get new employee code
router.get("/employeeCode", isAuth, getNextEmployeeCode);
//add employee
router.post("/add", isAuth, isAuthorizedToCreate, addEmployee);
//fetch one employee
router.get("/fetch/:id", isAuth, fetchOneEmployee);
//fetch employees
router.get("/fetchAllEmployees", isAuth, fetchEmployees);
//deletet employees
router.post("/delete", isAuth, isAuthorizedToDelete, deleteManyEmployee);
//delete one employee
router.delete("/:id", isAuth, isAuthorizedToDelete, deleteOneEmployee);
//update employee
router.put("/update/:id", isAuth, isAuthorizedToUpdate, updateEmployee);
//-------------------------------------------------------------------------------
//get new employee transaction code
router.get("/tracationCode", isAuth, getNextTransactionCode);
//add employee transation
router.post("/addtransation", isAuth, isAuthorizedToCreate, addEmpTransaction);
//update employee transaction
router.put(
  "/updatetransaction/:transactionId/:empId",
  isAuth,
  isAuthorizedToUpdate,
  updateEmpTransaction
);
//fetch employees tranaction
router.get("/fetchemptransation", isAuth, fetchTransactions);
//delete one employee transation
router.delete(
  "/transaction/:transactionId/:empId",
  isAuth,
  isAuthorizedToDelete,
  deleteOneEmpTransaction
);
//deletet employee transactions
router.post(
  "/deletetransation",
  isAuth,
  isAuthorizedToDelete,
  deleteManyEmpTransactions
);

module.exports = router;
