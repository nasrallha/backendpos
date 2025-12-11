const Employee = require("../models/employeeModel.js");
const {
  uploadOneImage,
  createUploadFolder,
  deleteUploadImage,
  preventDeletionIfUsed,
} = require("../middleware/helperMiddleware.js");
const path = require("path");
const employeeDestination = path.join(
  path.dirname(__dirname),
  "./uploads/employees"
);
const multer = require("multer");
const CustomError = require("../config/CustomError");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");
const { default: mongoose } = require("mongoose");
const dayjs = require("dayjs");
const quarterOfYear = require("dayjs/plugin/quarterOfYear");
dayjs.extend(quarterOfYear);

// get next employee code
const getNextEmployeeCode = asyncErorrHandeler(async (req, res, next) => {
  try {
    const lastEmployee = await Employee.findOne({}).sort({ code: -1 }).limit(1);
    if (lastEmployee !== null) {
      const nextEmployeeCode = parseInt(lastEmployee.code) + 1;
      return res.status(200).json({ code: nextEmployeeCode });
    } else {
      return res.status(200).json({ code: 1 });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
// get next transaction code
const getNextTransactionCode = async (req, res, next) => {
  try {
    const lastTransactionCode = await Employee.aggregate([
      { $unwind: "$transactions" },
      {
        $sort: { "transactions.transactionCode": -1 },
      },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          lastCode: "$transactions.transactionCode",
        },
      },
    ]);
    const lastCode =
      lastTransactionCode.length > 0
        ? parseInt(lastTransactionCode[0].lastCode)
        : 0;
    const nextCode = (lastCode + 1).toString();
    return res.status(200).json({ code: nextCode });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

//add new employee
const addEmployee = (req, res, next) => {
  try {
    //create employee upload
    createUploadFolder(employeeDestination);
    const uploadEmployyImage = uploadOneImage(employeeDestination, "employee");
    let employeeImage = "";
    let employeeImagePath = "";
    uploadEmployyImage(req, res, async (err) => {
      const {
        code,
        name,
        ar_name,
        email,
        phone,
        salary,
        address,
        ar_address,
        status,
      } = req.body;
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        // Everything went fine.
        if (req.file) {
          employeeImage = `${process.env.URL}/employees/${req.file.filename}`;
          employeeImagePath = `${employeeDestination}/${req.file.filename}`;
        } else {
          employeeImage = "";
        }
        //check if supplier is exsist
        const query = [];
        if (phone) query.push({ phone });
        if (email) query.push({ email });
        if (name) query.push({ name });
        if (query.length > 0) {
          const exsistEmployee = await Employee.findOne({
            $or: query,
          }).exec();

          if (exsistEmployee) {
            if (req.file) {
              deleteUploadImage(employeeImagePath);
            }
            if (name && exsistEmployee.name === name) {
              return next(
                new CustomError("This employee  name already exists", 400)
              );
            }
            if (phone && exsistEmployee.phone === phone) {
              return next(
                new CustomError(
                  "This employee phone number already exists",
                  400
                )
              );
            }
            if (email && exsistEmployee.email === email) {
              return next(
                new CustomError("This employee email already exists", 400)
              );
            }
          }
        }
        // create new employee
        const newEmployee = await Employee.create({
          code: code.trim(),
          name: name.trim(),
          ar_name: ar_name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          ar_address: ar_address.trim(),
          salary: salary.trim(),
          image: employeeImage,
          transactions: [],
          status,
        });
        if (newEmployee !== null) {
          const _newCusteomer = await Employee.findOne({
            _id: newEmployee._id,
          }).exec();
          return res.status(201).json({ employee: _newCusteomer });
        } else {
        }
      }
    });
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${employeeDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};
// fetch one employee
const fetchOneEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id }).exec();
    if (employee != null) {
      return res.status(200).json({ employee });
    } else {
      return next(
        new CustomError(
          `No employee founded with this id ${req.params.id}`,
          400
        )
      );
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// fetch all employees
const fetchEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({}).exec();
    if (employees.length > 0) {
      return res.status(200).json({ employees });
    } else {
      return res
        .status(404)
        .json({ employees: [], newCode: 1, msg: "No employee founded" });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//update employee
const updateEmployee = (req, res, next) => {
  try {
    //check employee  folder is exsist or created
    createUploadFolder(employeeDestination);
    // upload supplier image
    const updatedUploadEmployeeImage = uploadOneImage(
      employeeDestination,
      "employee"
    );
    updatedUploadEmployeeImage(req, res, async (err) => {
      const { id } = req.params;
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        // Everything went fine.
        const emp = await Employee.findOne({ _id: id }).exec();
        let newEmployeeImage = "";
        if (req.file) {
          newEmployeeImage = `${process.env.URL}/employees/${req.file.filename}`;
        }
        if (emp) {
          if (emp.image !== "") {
            const oldEmployeeImage = emp.image.split("/").pop();
            if (req.file) {
              // delete old image
              deleteUploadImage(`${employeeDestination}/${oldEmployeeImage}`);
            } else {
              newEmployeeImage = emp.image;
            }
          }
          req.body.image = newEmployeeImage;
          const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: id },
            { $set: req.body },
            { new: true, upsert: true }
          );
          return res.status(200).json({ employee: updatedEmployee });
        } else {
          // delete upload image
          if (req.file) {
            deleteUploadImage(`${employeeDestination}/${req.file.filename}`);
          }
          return next(new CustomError("This employee is not exsist", 400));
        }
      }
    });
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${employeeDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};
//delete many employee
const deleteManyEmployee = async (req, res, next) => {
  const { employeeIds } = req.body;
  let deletedEmployees = [];
  try {
    if (employeeIds.length === 0) {
      return next(new CustomError("No employee Selected", 400));
    } else {
      for (let i = 0; i < employeeIds.length; i++) {
        const empId = employeeIds[i];
        const employee = await Employee.findById(empId).exec();
        if (!employee) {
          return next(new CustomError(`This ${empId} is not exsist`, 400));
        }
        // await preventDeletionIfUsed(employee, "employee");
        const deletedEmployee = await Employee.findOneAndDelete({
          _id: empId,
        }).exec();
        if (deletedEmployee) {
          if (deletedEmployee.image !== "") {
            deleteUploadImage(
              `${employeeDestination}/${deletedEmployee.image.split("/").pop()}`
            );
          }
        } else {
          return next(new CustomError(`This ${cateId} is not exsist`, 400));
        }
        deletedEmployees = [...deletedEmployees, deletedEmployee];
      }
      if (employeeIds.length === deletedEmployees.length) {
        return res
          .status(200)
          .json({ msg: "employees successful deleted", ids: employeeIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
//delete one employee
const deleteOneEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).exec();
    if (!employee) {
      return next(new CustomError(`This ${req.params.id} is not exsist`, 400));
    }
    // await preventDeletionIfUsed(customer, "customer");
    const deletedEmployee = await Employee.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    if (deletedEmployee) {
      if (deletedEmployee.image !== "") {
        deleteUploadImage(
          `${employeeDestination}/${deletedEmployee.image.split("/").pop()}`
        );
      }
      return res.status(200).json({ id: deletedEmployee._id });
    } else {
      return next(new CustomError("This employee is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// ---------employe transactions ---------
//add new empTransaction
const addEmpTransaction = asyncErorrHandeler(async (req, res, next) => {
  const { code, employee, type, amount, date, reason } = req.body;
  const newTransaction = {
    transactionCode: code,
    type,
    amount,
    date,
    reason,
    createdBy: req.user.id,
  };
  try {
    //check employee is exsist
    const newEmpTransaction = await Employee.updateOne(
      { _id: new mongoose.Types.ObjectId(employee) },
      { $push: { transactions: newTransaction } },
      { new: true, unsert: true }
    ).exec();
    // create emp transaction
    if (newEmpTransaction.modifiedCount > 0) {
      const _newEmpTransaction = await Employee.findById(employee)
        .populate({ path: "transactions.createdBy", select: "_id name" })
        .exec();
      const addedTransaction = _newEmpTransaction.transactions.find(
        (t) => t.transactionCode === code
      );
      const finalTransaction = {
        ...addedTransaction.toObject(),
        employee: {
          _id: _newEmpTransaction._id,
          code: _newEmpTransaction.code,
          name: _newEmpTransaction.name,
          ar_name: _newEmpTransaction.ar_name,
        },
      };
      return res.status(201).json({ transaction: finalTransaction });
    } else {
      return next(
        new CustomError(
          "This transaction don't created this is some error",
          400
        )
      );
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
// update emp transaction
const updateEmpTransaction = async (req, res, next) => {
  const { empId, transactionId } = req.params;
  const updateData = req.body;
  try {
    const updatedEmpTransaction = await Employee.findOneAndUpdate(
      {
        _id: empId,
        "transactions._id": transactionId,
      },
      {
        $set: {
          "transactions.$.type": updateData.type,
          "transactions.$.amount": updateData.amount,
          "transactions.$.date": updateData.date,
          "transactions.$.reason": updateData.reason,
        },
      },
      { new: true, runValidators: true }
    )
      .populate({ path: "transactions.createdBy", select: "_id name" })
      .exec();
    if (updatedEmpTransaction) {
      const updateTransaction = updatedEmpTransaction.transactions.find(
        (t) => t._id === updatedEmpTransaction.transactions[0]._id
      );
      const finalTransaction = {
        ...updateTransaction.toObject(),
        employee: {
          _id: updatedEmpTransaction._id,
          code: updatedEmpTransaction.code,
          name: updatedEmpTransaction.name,
          ar_name: updatedEmpTransaction.ar_name,
        },
      };
      return res.status(200).json({ transaction: finalTransaction });
    } else {
      return next(new CustomError("Transaction not found", 404));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// delete one emp transaction
const deleteOneEmpTransaction = async (req, res, next) => {
  const { empId, transactionId } = req.params;

  try {
    const deletedEmpTransaction = await Employee.updateOne(
      { _id: empId },
      { $pull: { transactions: { _id: transactionId } } }
    );
    if (deletedEmpTransaction.modifiedCount > 0) {
      return res
        .status(200)
        .json({
          id: transactionId,
          message: "Transaction deleted successfully",
        });
    } else {
      return next(new CustomError("Transaction not found", 404));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// delete multiple transactions for different employees
const deleteManyEmpTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body; // empId , transactionId
    if (!transactions || transactions.length === 0) {
      return next(new CustomError("No transactions provided", 400));
    }
    // transaction to delete
    const bulkOps = transactions.map(({ empId, transactionId }) => ({
      updateOne: {
        filter: { _id: empId },
        update: { $pull: { transactions: { _id: transactionId } } },
      },
    }));
    await Employee.bulkWrite(bulkOps);
    return res.status(200).json({
      message: "Transactions deleted successfully",
      ids: transactions.map((r) => r.transactionId),
    });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// fetch all emp transaction
const fetchTransactions = async (req, res) => {
  try {
    const transEmp = await Employee.aggregate([
      {
        $match: {},
      },
      {
        $unwind: "$transactions",
      },
    ]);

    if (transEmp.length > 0) {
      const _empTran = transEmp.map((emp) => ({
        ...emp.transactions,
        employee: {
          _id: emp._id,
          code: emp.code,
          name: emp.name,
          ar_name: emp.ar_name,
        },
      }));
      return res.status(200).json({ transactions: _empTran });
    } else {
      return res.status(400).json({ msg: "No transactions founded" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// employee salary
const getEmployeeSalary = async (req, res, next) => {
  try {
    const { year, month, quarter, startDate, endDate, code, employee } = req.query;

    let employeeMatch = {};
    let dateFilter = null;

    if (code && code.trim() !== "") {
      employeeMatch.code = code.trim();
    }

    if (employee && employee.trim() !== "") {
      employeeMatch._id = new mongoose.Types.ObjectId(employee);
    }

    // فلترة بالتاريخ
    if (year && month) {
      const start = dayjs(`${year}/${month}/01`, "YYYY/MM/DD").startOf("month").format("YYYY/MM/DD");
      const end = dayjs(`${year}/${month}/01`, "YYYY/MM/DD").endOf("month").format("YYYY/MM/DD");
      dateFilter = { $gte: start, $lte: end };
    } else if (year && quarter) {
      const start = dayjs().year(Number(year)).quarter(Number(quarter)).startOf("quarter").format("YYYY/MM/DD");
      const end = dayjs().year(Number(year)).quarter(Number(quarter)).endOf("quarter").format("YYYY/MM/DD");
      dateFilter = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      const s = dayjs(startDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      const e = dayjs(endDate, "YYYY/MM/DD").format("YYYY/MM/DD");
      dateFilter = { $gte: s, $lte: e };
    }

    const matchStage = Object.keys(employeeMatch).length > 0 ? [{ $match: employeeMatch }] : [];

    const empSalaryAgg = await Employee.aggregate([
      ...matchStage,

      // لو فيه فلتر تاريخ
      ...(dateFilter
        ? [
            {
              $addFields: {
                filteredTransactions: {
                  $filter: {
                    input: "$transactions",
                    as: "t",
                    cond: {
                      $and: [
                        { $gte: ["$$t.date", dateFilter.$gte] },
                        { $lte: ["$$t.date", dateFilter.$lte] },
                      ],
                    },
                  },
                },
              },
            },
          ]
        : [
            { $addFields: { filteredTransactions: "$transactions" } },
          ]),

      // حساب الإجماليات
      {
        $addFields: {
          totalAdvance: {
            $ifNull: [
              {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$filteredTransactions",
                        as: "t",
                        cond: { $eq: ["$$t.type", "advance"] },
                      },
                    },
                    as: "a",
                    in: "$$a.amount",
                  },
                },
              },
              0,
            ],
          },
          totalDeduction: {
            $ifNull: [
              {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$filteredTransactions",
                        as: "t",
                        cond: { $eq: ["$$t.type", "deduction"] },
                      },
                    },
                    as: "d",
                    in: "$$d.amount",
                  },
                },
              },
              0,
            ],
          },
          totalBonus: {
            $ifNull: [
              {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$filteredTransactions",
                        as: "t",
                        cond: { $eq: ["$$t.type", "bonus"] },
                      },
                    },
                    as: "b",
                    in: "$$b.amount",
                  },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $addFields: {
          netSalary: {
            $subtract: [
              { $add: ["$salary", "$totalBonus"] },
              { $add: ["$totalAdvance", "$totalDeduction"] },
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          code: 1,
          name: 1,
          ar_name: 1,
          phone: 1,
          salary: 1,
          totalAdvance: 1,
          totalDeduction: 1,
          totalBonus: 1,
          netSalary: 1,
        },
      },
    ]);
    return res.status(200).json({ data: empSalaryAgg });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};





module.exports = {
  getNextEmployeeCode,
  getNextTransactionCode,
  addEmployee,
  updateEmployee,
  deleteManyEmployee,
  deleteOneEmployee,
  fetchEmployees,
  fetchOneEmployee,
  addEmpTransaction,
  fetchTransactions,
  updateEmpTransaction,
  deleteOneEmpTransaction,
  deleteManyEmpTransactions,
  getEmployeeSalary
};
