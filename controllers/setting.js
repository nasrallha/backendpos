const Setting = require("../models/settingModel.js");
const { uploadOneImage, createUploadFolder, deleteUploadImage } = require("../middleware/helperMiddleware.js");
const path = require("path");
const logoDestination = path.join(path.dirname(__dirname), "./uploads/logo");
const multer = require("multer");
const CustomError = require("../config/CustomError.js");



// add new company setting
const addCompanySetting = async(req, res , next)=>{
  try {
     //create logo upload folder
    createUploadFolder(logoDestination);
    const uploadCompanyLogo = uploadOneImage(logoDestination, "logo");
    let companyLogo = "";
    uploadCompanyLogo(req, res, async (err) => {
      const { companyName, ar_companyName,email, phone, bankAccount, vatNumber, commercialNo, country,city, district,street, 
        buildingNo, secondaryNo, postalCode ,salesIncludeTax,purchasesIncludeTax,taxRate,address
      } = req.body;
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return next(new CustomError(err.message, 400));
      } else {
        // Everything went fine.
        if (req.file) {
          companyLogo = `${process.env.URL}/logo/${req.file.filename}`;
        } else {
          companyLogo = "";
        };
        // check if company data exsist in setting or not
        const companySetting = await Setting.findOne({}).exec();
        if(companySetting !==null ){
          // update company setting
          if (companySetting.logo !== "") {
            const oldLogo = companySetting.logo.split('/').pop();
            if (req.file) {
              // delete old image
              deleteUploadImage(`${logoDestination}/${oldLogo}`);
              req.body.logo = `${process.env.URL}/logo/${req.file.filename}`
            } else {
              req.body.logo = companySetting.logo
            }
          }
            //update compny data
            const updatedCompanyData = await Setting.findOneAndUpdate({ }, req.body, { new: true, upsert: true }).exec();
            return res.status(200).json({ setting: updatedCompanyData });
        } else{
          // add new company setting
          const newCopmanySetting =  await Setting.create({
            companyName,
            ar_companyName,
            email,
            phone,
            bankAccount,
            vatNumber,
            commercialNo,
            country,
            city,
            district,
            street,
            buildingNo,
            secondaryNo,
            postalCode,
            salesIncludeTax,
            purchasesIncludeTax,
            taxRate,
            address,
            logo :companyLogo
          });
          if(newCopmanySetting !== null){
              const _newCompanySetting = await Setting.findOne({_id:newCopmanySetting._id}).exec();;
              return res.status(200).json({setting:_newCompanySetting});
          }else{
            if (req.file) {
              deleteUploadImage(`${logoDestination}/${req.file.filename}`);
            }
            return next(new CustomError('Some thing wrong', 400));
          }
        }
      }});
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${logoDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};
// fetch  setting
const fetchCompanySetting = async (req, res,next) => {
  try {
    const setting = await Setting.findOne({}).exec();
  if (setting !== null) {
    return res.status(200).json({setting});
  } else {
    return res.status(404).json({ setting: {}, msg: "No setting founded" });
  }
  } catch (error) {
    return next(new CustomError(error.message,400));
  }
};
//update company data
const updateCompanyData = async(req, res , next)=>{
  try {
     //create logo upload folder
    createUploadFolder(logoDestination);
    const uploadCompanyLogo = uploadOneImage(logoDestination, "logo");
    let companyLogo = "";
    uploadCompanyLogo(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return next(new CustomError(err.message, 400));
      } else {
        // Everything went fine.
        if (req.file) {
          companyLogo = `${process.env.URL}/logo/${req.file.filename}`;
        } else {
          companyLogo = "";
        };
        // check if company data exsist in setting or not
        const companySetting = await Setting.findOne({_id:req.params.id}).exec();
        if(companySetting !== null ){
          // update company setting
          if (companySetting.logo !== "") {
            const oldLogo = companySetting.logo.split('/').pop();
            if (req.file) {
              // delete old image
              deleteUploadImage(`${logoDestination}/${oldLogo}`);
              req.body.logo = `${process.env.URL}/logo/${req.file.filename}`
            } else {
              req.body.logo = companySetting.logo
            }
          };
          const {phone , address , notes,logo} = req.body;
            //update compny data
            const updatedCompanyData = await Setting.findOneAndUpdate({ _id:req.params.id}, {$set:{
              phone,
              address,
              notes,
              logo
            }}, { new: true, upsert: true }).exec();
            return res.status(200).json({ setting: updatedCompanyData });
        } else{
           return next(new CustomError(error.message, 400));
        }
      }});
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${logoDestination}/${req.file.filename}`);
    }
    return next(new CustomError(error.message, 400));
  }
};

module.exports = {
 addCompanySetting,
 fetchCompanySetting,
 updateCompanyData
};
