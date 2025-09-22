const express = require('express');
const router = express.Router();
const CustomError = require('../config/CustomError');

//handel error router
router.all('*',(req,res,next)=>{
    const err = new CustomError(`Can't find ${req.originalUrl} on the server`,404);
    next(err);
});



module.exports = router;