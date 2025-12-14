const mongoose = require("mongoose");
// const CustomError = require('./CustomError');
//connect mongoose
//mongodb://127.0.0.1:27017/infoStore
// const DB_URI = "mongodb://info:info123456@127.0.0.1:27017/infoStore?authSource=infoStore";
const connectionDB = async ()=>{
    try {
         mongoose.connect("mongodb://info:info123456@154.41.209.81:27017/infoStore?authSource=infoStore", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
     console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
module.exports={
    connectionDB
}