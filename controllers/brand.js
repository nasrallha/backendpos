const Brand = require("../models/brandModel");
const {uploadOneImage,createUploadFolder,deleteUploadImage, preventDeletionIfUsed} = require("../middleware/helperMiddleware.js");
const path = require("path");
const brandDestination = path.join(path.dirname(__dirname), "./uploads/brands");
const multer = require("multer");
const CustomError = require("../config/CustomError.js");

//add new brand
const addNewBrand = async(req, res,next) => {
  let brandImage = "";
  let brandImagePath = "";
  try {
      //create brand upload brand
      createUploadFolder(brandDestination);
      const uploadBrandImage = uploadOneImage(brandDestination, "brand");
      uploadBrandImage(req, res, async (err) => {
        const { name, ar_name, status } = req.body;
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          return res.status(400).json({ msg: `instanceof ${err.message}` });
        } else if (err) {
          // An unknown error occurred when uploading.
          return res.status(400).json({ msg: err.message })
        } else {
          // Everything went fine.
          if (req.file) {
            brandImage = `${process.env.URL}/brands/${req.file.filename}`;
            brandImagePath = `${brandDestination}/${req.file.filename}`;
          } else {
            brandImage = "";
          }
          const exsistBrand = await Brand.findOne({ name }).exec();
          //check if brand is exsist
          if (exsistBrand) {
            if (req.file) {
              deleteUploadImage(brandImagePath);
            }
            return next( new CustomError("This barnd is already exsist",400));
          }
        //  // check name or ar_name for brand
          if (!name || !ar_name) {
            if (req.file) {
              deleteUploadImage(brandImagePath);
            }
            return next( new CustomError("name and ar_name is required",400));
          };
        }
         // create new brand
      const newBrand = await Brand.create({
        name,
        ar_name,
        image: brandImage,
        status
      });
      if (newBrand !== null) {
        const _newBrand = await Brand.findOne({ _id: newBrand._id }).exec();
        return res.status(201).json({ brand: _newBrand });
      } else {
        return next( new CustomError("some thing wronge!",400));
      }
     });
  } catch (error) {
      deleteUploadImage(brandImagePath)
      return next( new CustomError(error.message,400));
  }
};
// update brand
const updateBrand = (req, res,next) => {
  try {
    //check brands folder is exsist or created
  createUploadFolder(brandDestination);
  // upload brand image 
  const updatedUploadBrandImage = uploadOneImage(brandDestination, "brand");
  updatedUploadBrandImage(req, res, async (err) => {
    const { id } = req.params;
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ msg: `instanceof ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ msg: err.message })
    } else {
      // Everything went fine.
      //find brand
      const brand = await Brand.findOne({ _id: id }).exec();
      let newBrandImage = "";
      if (req.file) {
        newBrandImage = `${process.env.URL}/brands/${req.file.filename}`;
      }
      if (brand) {
        if (brand.image !== "") {
          const oldBrandImage = brand.image.split('/').pop();
          if (req.file) {
            // delete old image
            deleteUploadImage(`${brandDestination}/${oldBrandImage}`);
          } else {
            newBrandImage = brand.image
          }
        }
        req.body.image = newBrandImage;
        const updatedBrand = await Brand.findOneAndUpdate({ _id: id }, req.body, { new: true, upsert: true,runValidators:true });
        return res.status(200).json({ brand: updatedBrand });
      } else {
        // delete upload image
        if (req.file) {
          deleteUploadImage(`${brandDestination}/${req.file.filename}`);
        }
        return next( new CustomError("This brand is not exsist",400));
      }
    }
  });
  } catch (error) {
    if (req.file) {
      deleteUploadImage(`${brandDestination}/${req.file.filename}`);
    }
    return next( new CustomError(error.message,400));
  }
  
};
//delete one brand
const deleteOnBrand = async (req, res,next) => {
  try {
    // find brand
    const brand = await Brand.findById(req.params.id).exec();
    if (!brand) {
      return next(new CustomError("This brand is not exsist", 400));
    }

    await preventDeletionIfUsed(brand, "brand");
    const deletedBrand = await Brand.findOneAndDelete({_id:req.params.id}).exec();
      if(deletedBrand){
        if (deletedBrand.image !== "") {
          deleteUploadImage(`${brandDestination}/${deletedBrand.image.split("/").pop()}`);
        }
        return res.status(200).json({id:deletedBrand._id});
    }else{
      return next( new CustomError( "This brand is not exsist",400));
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
  
};
//delete many brands
const deleteManyBrands = async (req, res,next) => {
  const { brandsIds } = req.body;
  let deletedBrands = [];
  try {
    if (brandsIds.length === 0) {
      return next( new CustomError("No Brands Selected",400));
    }else{
      for (let i = 0; i < brandsIds.length; i++) {
        const brandId = brandsIds[i];
        const brand = await Brand.findById(brandId).exec();
        if (!brand) {
          return next(new CustomError(`This ${brandId} is not exsist`, 400));
        }
        await preventDeletionIfUsed(brand, "brand");
        const deletedBrand = await Brand.findOneAndDelete({_id: brandId,}).exec();
        if (deletedBrand) {
          if (deletedBrand.image !== "") {
            deleteUploadImage(`${brandDestination}/${deletedBrand.image.split("/").pop()}`);
          }
        }else{
          return next( new CustomError(`This ${brandId} is not exsist`,400));
        }
        deletedBrands = [...deletedBrands, deletedBrand];
      }
      if (brandsIds.length === deletedBrands.length) {
        return res.status(200).json({ msg: "Brand successful deleted", ids: brandsIds });
      }
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
};
// fetch all brands
const fetchBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort([["createdDate",-1]]).exec();
    if (brands.length > 0) {
      return res.status(200).json({brands});
    } else {
      return res.status(404).json({ brands: [], msg: "No Brands founded" });
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
 
};
// brand pagination
// const getBrandPagination = async (req, res) => {
//   const { page, pageSize } = req.query;
//   if (!page || !pageSize) {
//     return res.status(400).json({ msg: "No page Entered" });
//   }
//   const skip = (page - 1) * pageSize;
//   const brands = await Brand.find({}).skip(skip).limit(pageSize).exec();
//   if (brands) {
//     return res.status(200).json({ brands });
//   } else {
//     return res.status(404).json({ brands: [], msg: "No brands founded" });
//   }
// };
//get one barnd
const getBrand = async(req,res)=>{
  const {id} = req.params;
  if(!id){
    return res.status(400).json({msg:"No brand selected"});
  }else{
    const brand = await Brand.findOne({_id:id}).exec();
    if(brand){
      return res.status(200).json({brand});
    }else{
      return res.status(400).json({msg:"sorry, no brand exsist"});
    }
  }
  
}

module.exports = {
  addNewBrand,
  fetchBrands,
  deleteManyBrands,
  deleteOnBrand,
  updateBrand,
  // getBrandPagination,
  getBrand
};
