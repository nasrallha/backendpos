const express = require('express');
const mongoose = require("mongoose");
const dotenv = require('dotenv').config();
const cors = require("cors");

const errorHandelRouter = require('./routes/errorHandelRouter');
const { connectionDB } = require('./config/connectDB');

// Routers
const categoryRouter = require('./routes/categoryRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const brandRouter = require('./routes/brandRoutes');
const productRouter = require('./routes/productRoutes');
const supplierRouter = require('./routes/supplierRoutes');
const customerRouter = require('./routes/customerRoutes');
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
const quotationRouter = require('./routes/quotationRoutes');
const employeeRouter = require('./routes/employeeRoutes');

const globalErrorHandler = require('./controllers/error');

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION", err);
    process.exit(1);
});

const app = express();

// ──────────────── Middlewares ────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));

// Health Check
app.get("/api/ping", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Check DB Connection (after startup)
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "غير قادر على الاتصال بقاعدة البيانات. حاول لاحقًا."
        });
    }
    next();
});

// ──────────────── Routes ────────────────
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/product', productRouter);
app.use('/api/supplier', supplierRouter);
app.use('/api/customer', customerRouter);
app.use('/api/role', roleRouter);
app.use('/api/page', pageRouter);
app.use('/api/permission', permissionRouter);
app.use('/api/unit', unitRouter);
app.use('/api/order', orderRouter);
app.use('/api/purchase', purchasesRouter);
app.use('/api/setting', settingRouter);
app.use('/api/discount', discountRouter);
app.use('/api/branch', branchRouter);
app.use('/api/sales', salesRouter);
app.use('/api/report', reportRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/voucher', voucherRouter);
app.use('/api/quotation', quotationRouter);
app.use('/api/employee', employeeRouter);

// 404 handler
app.use("*", errorHandelRouter);

// Global error handler
app.use(globalErrorHandler);

// ──────────────── Start Server ────────────────
const PORT = process.env.PORT || 8000;

connectionDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
