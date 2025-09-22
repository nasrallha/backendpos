const { mongoose } = require("mongoose");
const UserPermission = require("../models/userPermissionsModel.js");
const CustomError = require("../config/CustomError.js");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");


const addPermissionsToUser = asyncErorrHandeler(async(req,res,next)=>{
  try {
    const {user,permissions} = req.body;
      // chack if user  have any permission
      let userPermissions = [];
      const exsistUserPermission = await UserPermission.findOne({user:new mongoose.Types.ObjectId(user)}).exec();
        if(exsistUserPermission !== null){
        // update user permations
        const updatedUserPermissions = await UserPermission.findOneAndUpdate({user:exsistUserPermission.user},
        {$set:{
              "permissions":permissions,
            }},
        { new: true, upsert: true }
      );
      userPermissions = updatedUserPermissions.parmissions;
      }else{
        //add new user permations
         const newUserPermaission = UserPermission.create({
            user,
            permissions,
          });
         userPermissions = newUserPermaission.parmissions;
      } 
     return res.status(200).json({permissions:userPermissions})
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
//get user permissions
const getUserPermissions = asyncErorrHandeler(async(req,res,next)=>{
  try {
    const userPermissions = await UserPermission.findOne({user:new mongoose.Types.ObjectId(req.query.user)}).populate({path:"user",select:"_id name role"}).exec();
    if(userPermissions !==null){
      return res.status(200).json({permissions:userPermissions.permissions});
    }else{
      return next(new CustomError("This user has no permissions"),400);
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
//get  permissions for authenticated user
const getAuthPermissions = asyncErorrHandeler(async(req,res,next)=>{
  try {
    const authPermissions = await UserPermission.findOne({user:new mongoose.Types.ObjectId(req.user.id)}).populate({path:"user",select:"_id name role"}).exec();
    if(authPermissions !==null){
      return res.status(200).json({permissions:authPermissions.permissions});
    }else{
      return next(new CustomError("some thing worng!"),400);
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});


module.exports = {
  addPermissionsToUser,
  getUserPermissions,
  getAuthPermissions
};
