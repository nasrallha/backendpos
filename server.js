const express = require('express');
const dotenv =require('dotenv').config();
const cors = require("cors");
const path = require('path');
const errorHandelRouter = require('./routes/errorHandelRouter');
const {connectionDB} = require('./config/connectDB');
const categoryRouter = require('./routes/categoryRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const brandRouter = require('./routes/brandRoutes');
const productRouter = require('./routes/productRoutes');
const supplierRouter = require('./routes/supplierRoutes');
const customerRouter = require('./routes/customerRoutes')
const purchasesRouter = require('./routes/purchasesRoutes');
const roleRouter = require('./routes/roleRoutes');
const pageRouter = require('./routes/pageRoutes');
const permissionRouter = require('./routes/permissionRoutes');
const unitRouter = require('./routes/unitRoutes');
const orderRouter = require('./routes/orderRoutes');
const settingRouter = require('./routes/settingRoutes');
const discountRouter = require('./routes/discountRoutes');
const branchRouter = require('./routes/branchRoutes');
const salesRouter = require('./routes/salesRoutes');
const reportRouter = require('./routes/reportRoutes');
const paymentRouter = require('./routes/paymentsRountes');
const voucherRouter = require('./routes/voucherRoutes');
const printeRouter = require('./routes/printRoutes');
const globleErrorHandler = require('./controllers/error');

const CustomError = require('./config/CustomError');
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...');
    process.exit(1);
 })
const port  = process.env.PORT || 8000;

const app = express();
//cors
app.use(cors());
// body barser
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// folder upload images
app.use(express.static('uploads'));
// connect for database
connectionDB();
// use router
app.get("/api/ping", (req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/category',categoryRouter);
app.use('/api/brand',brandRouter);
app.use('/api/product',productRouter);
app.use('/api/supplier',supplierRouter);
app.use('/api/customer',customerRouter);
app.use('/api/role',roleRouter);
app.use('/api/page',pageRouter);
app.use('/api/permission',permissionRouter);
app.use('/api/unit',unitRouter);
app.use('/api/order',orderRouter);
app.use('/api/purchase',purchasesRouter);
app.use('/api/setting',settingRouter);
app.use('/api/discount',discountRouter);
app.use('/api/branch',branchRouter);
app.use('/api/sales',salesRouter);
app.use('/api/report',reportRouter);
app.use('/api/payments',paymentRouter);
app.use('/api/voucher',voucherRouter);
app.use('/api/print',printeRouter);
//error handler router
app.use('*',errorHandelRouter);
// handel express error
app.use(globleErrorHandler)
// run server
const server = app.listen(port,()=>{
    console.log(`Server running at port ${port}`)
});
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured! Shutting down...');
    server.close(() => {
     process.exit(1);
    })
 })
 
