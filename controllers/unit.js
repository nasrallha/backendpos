const Unit = require("../models/unitModel.js");
const CustomError = require("../config/CustomError");
const { preventDeletionIfUsed } = require("../middleware/helperMiddleware.js");

//add new unit
const addNewUnit = async (req, res, next) => {
  const { name, ar_name, status } = req.body;
  try {
    // check name or ar_name for unit
    // if (!name || !ar_name) {
    //   return res.status(400).json({ msg: " name unit and ar_name unit is required" });
    // };
    const exsistUnit = await Unit.findOne({
      $or: [{ name }, { ar_name }],
    }).exec();
    //check if unit is exsist
    if (exsistUnit) {
      return next(new CustomError("This unit is already exsist", 400));
    }
    // create new unit
    const newUnit = await Unit.create({
      name,
      ar_name,
      status,
    });
    if (newUnit !== null) {
      const _newUnit = await Unit.findOne({ _id: newUnit._id }).exec();
      return res.status(201).json({ unit: _newUnit });
    } else {
      return next(new CustomError("some thing wronge!", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// update unit
const updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    //find unit
    const unit = await Unit.findOne({ _id: id }).exec();
    if (unit) {
      const updatedUnit = await Unit.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        upsert: true,
        runValidators: true,
      });
      return res.status(200).json({ unit: updatedUnit });
    } else {
      return next(new CustomError("This unit is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
//delete one unit
const deleteOneUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id).exec();
    if (!unit) {
      return next(new CustomError(`This ${req.params.id} is not exsist`, 400));
    }
    await preventDeletionIfUsed(unit, "unit");
    const deletedUnit = await Unit.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    if (deletedUnit) {
      return res.status(200).json({ id: deletedUnit._id });
    } else {
      return next(new CustomError("This unit is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
//delete many units
const deleteManyUnits = async (req, res, next) => {
  try {
    const { unitsIds } = req.body;
    let deletedUnits = [];
    if (unitsIds.length === 0) {
      return next(new CustomError("No units selected", 400));
    } else {
      for (let i = 0; i < unitsIds.length; i++) {
        const unitId = unitsIds[i];
        const unit = await Unit.findById(unitId).exec();
        if (!unit) {
          return next(new CustomError(`This ${unitId} is not exsist`, 400));
        }
        await preventDeletionIfUsed(unit, "unit");
        const deletedUnit = await Unit.findOneAndDelete({ _id: unitId }).exec();
        if (!deletedUnit) {
          //   const deletedRoleePermissions = await Permission.findOneAndDelete({role:deletedRole._id}).exec();
          return next(new CustomError(`This ${unitId} is not exsist`, 400));
        }
        deletedUnits = [...deletedUnits, deletedUnit];
      }
      if (unitsIds.length === deletedUnits.length) {
        return res
          .status(200)
          .json({ msg: "unit successful deleted", ids: unitsIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// fetch all units
const fetchUnits = async (req, res, next) => {
  try {
    const units = await Unit.find()
      .sort([["createdDate", 1]])
      .exec();
    if (units.length > 0) {
      return res.status(200).json({ units });
    } else {
      return res.status(404).json({ units: [], msg: "No units founded" });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
module.exports = {
  addNewUnit,
  fetchUnits,
  deleteManyUnits,
  deleteOneUnit,
  updateUnit,
};
