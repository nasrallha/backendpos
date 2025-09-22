const mongoose = require("mongoose");
// const CustomError = require('./CustomError');
//connect mongoose

const connectionDB = ()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/infoStore', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
        // return res.ststus(200).json({msg:"Connected to MongoDB"})
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    //   const err = new CustomError(error,404);
    //   return next(err);
    });
};



module.exports={
    connectionDB
}