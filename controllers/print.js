const Sales = require("../models/salesModel");
const Setting = require("../models/settingModel");
const CustomError = require("../config/CustomError");
const escpos = require("escpos");
const USBAdapter = require("@node-escpos/usb-adapter");
const Jimp = require("jimp");

escpos.USB = USBAdapter;

const printCashier = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;

    // --- جلب الفاتورة ---
    const invoice = await Sales.findOne({ _id: invoiceId })
      .populate("customer")
      .populate({ path: "createdBy", select: "_id name email" })
      .exec();
    if (!invoice) return next(new CustomError("Invoice not found", 404));

    // --- جلب بيانات الشركة ---
    const setting = await Setting.findOne({}).exec();
    if (!setting) return next(new CustomError("No setting found", 404));

    const {
      items,
      invoiceNumber,
      customer,
      createdBy,
      payment1,
      payment2,
      saleDate,
      saleTime,
      seller,
      subTotalAmount,
      taxAmount,
      discountAmount,
      netAmount,
    } = invoice;

    const { companyName, ar_companyName, vatNumber, commercialNo, logo, phone, address } = setting;
    const isArabic = invoice.language === "ar" || false;

    // --- تهيئة الطابعة ---
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open(async () => {
      // --- شعار الشركة ---
      if (logo) {
        try {
          const logoImage = await Jimp.read(logo);
          const bmpLogo = await escpos.Image.load(logoImage.bitmap);
          printer.align("ct").image(bmpLogo);
        } catch (err) {
          console.log("Logo load failed:", err.message);
        }
      }

      // --- عنوان الشركة ---
      printer.align("ct");
      printer.text(isArabic ? ar_companyName : companyName);
      printer.text(`${isArabic ? "VAT" : "VAT Number"}: ${vatNumber}`);
      printer.text(`${isArabic ? "Commercial No" : "Commercial No"}: ${commercialNo}`);
      printer.text(`${isArabic ? "Phone" : "Phone"}: ${phone}`);
      if (address) printer.text(`${isArabic ? "Address" : "Address"}: ${address}`);
      printer.drawLine();
      printer.align("lt");

      // --- QR Code ---
      try {
        const qrText = `Invoice: ${invoiceNumber}\nDate: ${saleDate} ${saleTime}\nCustomer: ${customer?.name || "-"}\nTotal: ${netAmount.toFixed(2)}`;
        const qrImage = await Jimp.read(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`);
        const bmpQr = await escpos.Image.load(qrImage.bitmap);
        printer.align("ct").image(bmpQr).align("lt");
      } catch (err) {
        console.log("QR generation failed:", err.message);
      }

      // --- معلومات الفاتورة ---
      printer.text(`${isArabic ? "Invoice No" : "Invoice"}: ${invoiceNumber}`);
      printer.text(`${isArabic ? "Date" : "Date"}: ${saleDate}`);
      printer.text(`${isArabic ? "Time" : "Time"}: ${saleTime}`);
      printer.text(`${isArabic ? "Customer" : "Customer"}: ${customer?.name || "-"}`);
      printer.text(`${isArabic ? "Seller" : "Seller"}: ${createdBy?.name || seller || "-"}`);
      printer.text(`${isArabic ? "Payment 1" : "Payment"}: ${payment1}`);
      if (payment2) printer.text(`${isArabic ? "Payment 2" : "Payment"}: ${payment2}`);
      printer.drawLine();

      // --- جدول الأصناف ---
      printer.text(`Item               Qty   Price   Total`);
      printer.drawLine();
      items.forEach(item => {
        const name = (isArabic ? item.ar_name : item.name).padEnd(15, ' ');
        const qty = `${item.quantity}`.padEnd(5, ' ');
        const price = `${item.unitPrice.toFixed(2)}`.padEnd(7, ' ');
        const total = `${item.itemTotal.toFixed(2)}`.padEnd(7, ' ');
        printer.text(`${name}${qty}${price}${total}`);
      });
      printer.drawLine();

      // --- الملخص ---
      printer.text(`${isArabic ? "Subtotal" : "Subtotal"}: ${subTotalAmount.toFixed(2)}`);
      printer.text(`${isArabic ? "Tax" : "Tax"}: ${taxAmount.toFixed(2)}`);
      printer.text(`${isArabic ? "Discount" : "Discount"}: ${discountAmount.toFixed(2)}`);
      printer.text(`${isArabic ? "Net Total" : "Net Total"}: ${netAmount.toFixed(2)}`);

      printer.drawLine();
      printer.cut().close();

      res.json({ success: true, message: "Invoice sent to printer" });
    });

  } catch (error) {
    return next(new CustomError(error.message || error, 400));
  }
};

module.exports = { printCashier };
