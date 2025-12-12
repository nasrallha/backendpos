const mongoose = require("mongoose");
// const CustomError = require('./CustomError');
//connect mongoose
//mongodb://127.0.0.1:27017/infoStore
// const DB_URI = "mongodb://info:info123456@127.0.0.1:27017/infoStore?authSource=infoStore";
const connectionDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};



module.exports={
    connectionDB
}