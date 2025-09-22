const Permission = require("../models/permissionModel.js");
const UserPermission = require("../models/userPermissionsModel.js");
const CustomError = require("../config/CustomError.js");
const asyncErorrHandeler = require("../middleware/asyncErorrHandeler.js");

//add new permission
const addNewPermission = asyncErorrHandeler(async (req, res, next) => {
  const { name, ar_name, key, status } = req.body;
  try {
    // check name or ar_name for role
    // if (!name || !ar_name) {
    //   return res.status(400).json({ msg: " name role and ar_name role is required" });
    // };
    const exsistPermission = await Permission.findOne({ $or: [{ name }, { ar_name }] }).exec();
    //check if permission is exsist
    if (exsistPermission) {
      return next(new CustomError("This permission is already exsist", 400));
    }
    // create new permission
    const newPermission = await Permission.create({
      name,
      ar_name,
      key,
      status
    });
    if (newPermission !== null) {
      const _newPermission = await Permission.findOne({ _id: newPermission._id }).exec();
      return res.status(201).json({ permission: _newPermission });
    } else {
      return next(new CustomError("This permission don't created this is some error", 400));
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
});
// updatePermission
const updatePermission = async (req, res, next) => {
  const { id } = req.params;
  try {
    const perm = await Permission.findById(id).exec();

    if (!perm) {
      return next(new CustomError("This permission does not exist", 400));
    }

    const updatedPermission = await Permission.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true, runValidators: true }
    );

    await UserPermission.updateMany(
      { permissions: perm.key },
      [
        {
          $set: {
            permissions: {
              $map: {
                input: "$permissions",
                as: "p",
                in: {
                  $cond: [
                    { $eq: ["$$p", perm.key] },
                    updatedPermission.key,
                    "$$p"
                  ]
                }
              }
            }
          }
        }
      ]
    );

    return res.status(200).json({ permission: updatedPermission });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};

//delete one permission
const deleteOnePermission = async (req, res, next) => {
  try {
    const deletedPermission = await Permission.findByIdAndDelete(req.params.id);

    if (!deletedPermission) {
      return next(new CustomError("This permission does not exist", 400));
    }
    await UserPermission.updateMany(
      { permissions: deletedPermission.key },
      { $pull: { permissions: deletedPermission.key } }
    );
    return res.status(200).json({ id: deletedPermission._id });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};
// delete many permission
const deleteManyPermission = async (req, res, next) => {
  const { permissionsIds } = req.body;

  try {
    if (!permissionsIds || permissionsIds.length === 0) {
      return next(new CustomError("No permissions selected", 400));
    }

    // هات كل permissions اللي هتتمسح
    const deletedPermissions = await Permission.find({ _id: { $in: permissionsIds } });

    if (deletedPermissions.length === 0) {
      return next(new CustomError("No matching permissions found", 400));
    }

    const deletedKeys = deletedPermissions.map(p => p.key);

    // Permission collection
    await Permission.deleteMany({ _id: { $in: permissionsIds } });

    // UserPermission documents
    await UserPermission.updateMany(
      { permissions: { $in: deletedKeys } },
      { $pull: { permissions: { $in: deletedKeys } } }
    );

    return res.status(200).json({
      msg: "Permissions successfully deleted",
      ids: permissionsIds,
      keys: deletedKeys,
    });
  } catch (error) {
    return next(new CustomError(error.message, 500));
  }
};


// fetch all permissions
const fetchPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find().sort([["createdDate", 1]]).exec();
    if (permissions.length > 0) {
      return res.status(200).json({ permissions });
    } else {
      return res.status(404).json({ permissions: [], msg: "No permissions founded" });
    }

  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
module.exports = {
  //  addPermissions,
  //  getUserPermissions
  addNewPermission,
  updatePermission,
  deleteOnePermission,
  deleteManyPermission,
  fetchPermissions
};
