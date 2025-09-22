const User = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const {
  uploadOneImage,
  createUploadFolder,
  deleteUploadImage,
} = require("../middleware/helperMiddleware.js");
const path = require("path");
const avatarDestination = path.join(path.dirname(__dirname), "./uploads/users");
const multer = require("multer");
const CustomError = require("../config/CustomError.js");
const fs = require("fs");

const uploadUserAvatar = async (req, res) => {
  try {
    const uploadAvater = uploadOneImage(avatarDestination, "avatar");

    // find user
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // create upload folder
    createUploadFolder(avatarDestination);

    uploadAvater(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ msg: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ msg: "No image selected!" });
      }

      // build new avatar url
      const newAvatar = `${process.env.URL}/users/${req.file.filename}`;
      // old avatar
      if (user.avatar && user.avatar !== "") {
        const oldAvatar = user.avatar.split("/").pop();
        const oldavatarpath = `${avatarDestination}/${oldAvatar}`;
        if (fs.existsSync(oldavatarpath)) {
          deleteUploadImage(oldavatarpath);
        }
      }

      // update user
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { avatar: newAvatar } },
        { upsert: true, new: true }
      ).exec();
      return res.status(200).json({
        success: true,
        avatar: newAvatar,
        user: updatedUser,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// update user
const updateUser = (req, res, next) => {
  try {
    //check user folder is exsist or created
    createUploadFolder(avatarDestination);
    // upload user image
    const updatedUploadUserImage = uploadOneImage(avatarDestination, "avatar");
    updatedUploadUserImage(req, res, async (err) => {
      const { id } = req.params;
      const { name, email, password, role, username } = req.body;
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        // Everything went fine.
        //find user
        const user = await User.findOne({ _id: id }).exec();
        let newUserAvatar = "";
        if (req.file) {
          newUserAvatar = `${process.env.URL}/users/${req.file.filename}`;
        }
        if (user) {
          if (user.avatar !== "") {
            const oldUserAvatar = user.avatar.split("/").pop();
            if (req.file) {
              // delete old image
              deleteUploadImage(`${avatarDestination}/${oldUserAvatar}`);
            } else {
              newUserAvatar = user.avatar;
            }
          }

          //has password  check if password change or not change
          const hasPassword =
            user.password === password
              ? user.password
              : bcrypt.hashSync(password, 10);
          const newUserValue = {
            name,
            email,
            username,
            password: hasPassword,
            role,
            avatar: newUserAvatar,
          };
          const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            newUserValue,
            { new: true, upsert: true, runValidators: true }
          )
            .select("-createdAt -updatedAt")
            .exec();
          return res.status(200).json({ user: updatedUser });
        } else {
          // delete upload image
          if (req.file) {
            deleteUploadImage(`${avatarDestination}/${req.file.filename}`);
          }
          return next(new CustomError("This user is not exsist", 400));
        }
      }
    });
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${avatarDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};
//delete one user
const deleteOnUser = async (req, res, next) => {
  try {
    // check if this user loginded
    if (req.params.id === req.user.id) {
      return next(
        new CustomError(
          "This user is Currently used please logout and try again by anther user",
          400
        )
      );
    } else {
      const user = await User.findById(req.params.id).exec();
      if (!user) {
        return next(
          new CustomError(`This ${req.params.id} is not exsist`, 400)
        );
      }
      await preventDeletionIfUsed(user, "user");
      const deletedUser = await User.findOneAndDelete({
        _id: req.params.id,
      }).exec();
      if (deletedUser) {
        if (deletedUser.avatar !== "") {
          deleteUploadImage(
            `${avatarDestination}/${deletedUser.avatar.split("/").pop()}`
          );
        }
        return res.status(200).json({ id: deletedUser._id });
      } else {
        return next(new CustomError("This user is not exsist", 400));
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
//delete many users
const deleteManyUsers = async (req, res, next) => {
  const { usersIds } = req.body;
  let deletedUsers = [];
  try {
    if (usersIds.length === 0) {
      return next(new CustomError("No users Selected", 400));
    } else {
      for (let i = 0; i < usersIds.length; i++) {
        const userId = usersIds[i];
        if (userId === req.user.id) {
          return next(
            new CustomError(
              "Users to be deleted, one of them is logged in now",
              400
            )
          );
        } else {
          const user = await User.findById(userId).exec();
          if (!user) {
            return next(new CustomError(`This ${userId} is not exsist`, 400));
          }
          await preventDeletionIfUsed(user, "user");
          const deletedUser = await User.findOneAndDelete({
            _id: userId,
          }).exec();
          if (deletedUser) {
            if (deletedUser.image !== "") {
              deleteUploadImage(
                `${avatarDestination}/${deletedUser.avatar.split("/").pop()}`
              );
            }
          } else {
            return next(
              new CustomError(`This ${deletedUser} is not exsist`, 400)
            );
          }
          deletedUsers = [...deletedUsers, deletedUser];
        }
      }
      if (usersIds.length === deletedUsers.length) {
        return res
          .status(200)
          .json({ msg: "users successful deleted", ids: usersIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// fetch all users
const fetchUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $nin: ["super admin", "admin"] } })
      .sort([["createdDate", -1]])
      .select("-createdAt -updatedAt")
      .exec();
    if (users.length > 0) {
      return res.status(200).json({ users });
    } else {
      return res.status(404).json({ users: [], msg: "No users founded" });
    }
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};

module.exports = {
  uploadUserAvatar,
  fetchUsers,
  updateUser,
  deleteOnUser,
  deleteManyUsers,
};
