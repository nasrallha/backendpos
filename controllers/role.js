const Role = require("../models/roleModel.js");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");
const CustomError = require("../config/CustomError.js");

//add new role
const addNewRole = asyncErorrHandeler(async (req, res,next) => {
  const { name, ar_name, status } = req.body;
  try {
    // check name or ar_name for role
    // if (!name || !ar_name) {
    //   return res.status(400).json({ msg: " name role and ar_name role is required" });
    // };
    const exsistRole = await Role.findOne({$or:[{name},{ar_name}]  }).exec();
    //check if role is exsist
    if (exsistRole) {
      return next(new CustomError("This role is already exsist",400));
    }
    // create new role
    const newRole = await Role.create({
      name,
      ar_name,
      status
    });
    if (newRole !== null) {
      const _newRole = await Role.findOne({ _id: newRole._id }).exec();
        return res.status(201).json({ role: _newRole });
    } else {
      return next(new CustomError("This role don't created this is some error",400));
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
});
// update role
const updateRole = async (req, res,next) => {
  const { id } = req.params;
  try {
    //find role
    const role = await Role.findOne({ _id: id }).exec();
    if (role) {
      const updatedRole = await Role.findOneAndUpdate({ _id: id }, req.body, { new: true, upsert: true ,runValidators:true});
      return res.status(200).json({ role: updatedRole });
    } else {
      return next(new CustomError("This role is not exsist",400));
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  } 
};
//delete one role
const deleteOneRole = async (req, res,next) => {
  try {
    const deletedRole = await Role.findOneAndDelete({_id:req.params.id}).exec();
    if(deletedRole){
      return res.status(200).json({id:deletedRole._id});
    }else{
      return next(new CustomError("This role is not exsist",400));
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
//delete many roles
const deleteManyRoles = async (req, res,next) => {
  const { rolesIds } = req.body;
  let deletedRoles = [];
  try {
    if (rolesIds.length === 0) {
      return next(new CustomError("No Roles Selected",400));
    }else{
      for (let i = 0; i < rolesIds.length; i++) {
        const roleId = rolesIds[i];
        const deletedRole = await Role.findOneAndDelete({_id: roleId,}).exec();
        if (!deletedRole) {
            return next(new CustomError(`This ${roleId} is not exsist`,400));
        }
        deletedRoles = [...deletedRoles, deletedRole];
      }
      if (rolesIds.length === deletedRoles.length) {
        return res.status(200).json({ msg: "Role successful deleted", ids: rolesIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
// fetch all roles
const fetchRoles = async (req, res,next) => {
  try {
    const roles = await Role.find().sort([["createdDate",1]]).exec();
    if (roles.length > 0) {
      return res.status(200).json({roles});
    } else {
      return res.status(404).json({ roles: [], msg: "No roles founded" });
    }
    
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
// brand pagination
// const getBrandPagination = async (req, res) => {
//   const { page, pageSize } = req.query;
//   if (!page || !pageSize) {
//     return res.status(400).json({ msg: "No page Entered" });
//   }
//   const skip = (page - 1) * pageSize;
//   const brands = await Brand.find({}).skip(skip).limit(pageSize).exec();
//   if (brands) {
//     return res.status(200).json({ brands });
//   } else {
//     return res.status(404).json({ brands: [], msg: "No brands founded" });
//   }
// };
//get one role
const getRole = async(req,res,next)=>{
  const {id} = req.params;
  try {
    if(!id){
      return next(new CustomError("No role selected",400));
    }else{
      const role = await Role.findOne({_id:id}).populate({path:"createdBy",select:"_id name email role"}).exec();
      if(role){
        return res.status(200).json({brand});
      }else{
        return next(new CustomError("sorry, no role exsist",400));
      }
    }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
module.exports = {
  addNewRole,
  fetchRoles,
  deleteManyRoles,
  deleteOneRole,
  updateRole,
  getRole
};
