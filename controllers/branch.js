const Branch = require("../models/branchModel.js");
const CustomError = require("../config/CustomError.js");

//add new branch
const addNewBranch = async (req, res,next) => {
  const { name, ar_name, location,status,code } = req.body;
  try {
    const exsistBranch = await Branch.findOne({$or:[{name},{ar_name}]}).exec();
    //check if branch is exsist
    if (exsistBranch) {
      return next(new CustomError("This branch is already exsist",400));
    }
    // create new branch
    const newBranch = await Branch.create({
      name,
      ar_name,
      status,
      location,code
    });
    if (newBranch !== null) {
      const _newBranch = await Branch.findOne({ _id: newBranch._id }).exec();
      return res.status(201).json({ branch: _newBranch });
    } else {
      return next(new CustomError("some thing wronge!",400));
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
// update branch
const updateBranch = async (req, res,next) => {
  try {
    const { id } = req.params;
      //find branch
      const branch = await Branch.findOne({ _id: id }).exec();
      if(branch){
        const updatedBranch = await Branch.findOneAndUpdate({ _id: id }, req.body, { new: true, upsert: true ,runValidators:true});
        return res.status(200).json({ branch: updatedBranch });
      } else {
        return next(new CustomError("This branch is not exsist",400));
      }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
//delete one branch
const deleteOneBranch = async (req, res,next) => {
  try {
    const deletedBranch = await Branch.findOneAndDelete({_id:req.params.id}).exec();
  if(deletedBranch){
    return res.status(200).json({id:deletedBranch._id});
  }else{
    return next(new CustomError("This branch is not exsist",400));
  }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
//delete many branches
const deleteManyBranches = async (req, res,next) => {
  try {
    const { branchesIds } = req.body;
    let deletedBranches = [];
    if (branchesIds.length === 0) {
      return next(new CustomError("No branches selected",400));
    }else{
      for (let i = 0; i < branchesIds.length; i++) {
        const branchId = branchesIds[i];
        const deletedUnit = await Branch.findOneAndDelete({_id: branchId,}).exec();
        if (!deletedUnit) {
          //   const deletedRoleePermissions = await Permission.findOneAndDelete({role:deletedRole._id}).exec();
          return next(new CustomError(`This ${branchId} is not exsist`,400));
        }
        deletedBranches = [...deletedBranches, deletedUnit];
      }
      if (branchesIds.length === deletedBranches.length) {
        return res.status(200).json({ msg: "branch successful deleted", ids: branchesIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
// fetch all branches
const fetchBranches = async (req, res,next) => {
  try {
    const branches = await Branch.find().sort([["createdDate",1]]).exec();
    if (branches.length > 0) {
      return res.status(200).json({branches});
    } else {
      return res.status(404).json({ branches: [], msg: "No branches founded" });
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
module.exports = {
addNewBranch,
updateBranch,
deleteOneBranch,
deleteManyBranches,
fetchBranches
};
