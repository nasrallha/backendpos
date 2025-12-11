const User = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const { createToken } = require("../middleware/helperMiddleware.js");
const {
  uploadOneImage,
  createUploadFolder,
  deleteUploadImage
} = require("../middleware/helperMiddleware.js");
const path = require("path");
const avatarDestination = path.join(path.dirname(__dirname), "./uploads/users");
const multer = require("multer");
const CustomError = require("../config/CustomError.js");




// register user
const registerUser = async (req, res,next) => {
  try {
    // create upload folder
  createUploadFolder(avatarDestination);
  const uploadAvater = uploadOneImage(avatarDestination, "avatar");
  uploadAvater(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ msg: err });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ msg: "An unknown error occurred when uploading" })
    }
    // Everything went fine.
    const { name, email, password, role,username } = req.body;
    let avatarPath;
    if(req.file){
      avatarPath =`${avatarDestination}/${req.file.filename}`
    }
    if (!name || !email || !password || !username) {
      if (req.file) {
        deleteUploadImage(avatarPath);
      }
      res.status(400).json({ msg: "name , email , password , username  is rquired !" })
    }
    // check user exsist
    const userExsist = await User.findOne({$or:[{username},{email}] }).exec();
    if (userExsist) {
      // check upload image
      if (req.file) {
        //delete uploaded image
        deleteUploadImage(avatarPath)
      }
      return res.status(400).json({ msg: "This user is already exsist exsist" })
    } else {
      //has password 
      const hasPassword = bcrypt.hashSync(password, 10);
      //create new user
      const _user = await User.create({
        name,
        email,
        username,
        password: hasPassword,
        role,
        avatar: req.file ? `${process.env.URL}/users/${req.file.filename}` : ""
      });
        if(_user !== null){
          const user = await User.findOne({ _id: _user._id })
          .select('-createdAt -updatedAt').exec();
            return res.status(201).json({ user });
       }else{
        return next( new CustomError("some thing wronge!",400));
       }
    }
  });
  } catch (error) {
    if(req.file){
      deleteUploadImage(avatarPath);
    }
    return next(new CustomError(error.message,400))
  }

};
//login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  //check if user exsist
  const _user = await User.findOne({username}).exec();
  if (_user) {
    // compare password
    bcrypt.compare(password, _user.password, async (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        // create token and login
        const token = createToken(_user, "1d");
        // get user
       const user ={
        _id:_user._id,
        name:_user.name,
        username:_user.username,
        email:_user.email,
        role:_user.role,
       }
        return res.status(200).json({ user,token });
       
      } else {
        return res.status(400).json({ msg: "This Pasword is Not Correct" });
      }
    });
  } else {
    // not found
    return res.status(404).json({ msg: "This user is Not Exsist" });
  }
};
const loginedUser = async(req, res) => {
  const user = await User.findOne({ _id: req.user.id })
  .select('-password -createdAt -updatedAt').exec();
  if(user == null){
    return res.status(400).json({ msg:"No user Exsist in DB" });
  }else{
    return res.status(200).json({ user });
  }
 
}

module.exports = {
  registerUser,
  loginUser,
  loginedUser
}
