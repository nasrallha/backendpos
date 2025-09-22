const express = require('express');
const router = express.Router();
const {registerUser,loginUser, loginedUser} = require('../controllers/authUser.js');
const {isAuth} = require('../middleware/authMiddleware.js');

// user register
router.post('/user/register',registerUser);
// user login
router.post('/user/login',loginUser);
// get user
router.get('/user',isAuth,loginedUser);


module.exports = router;