const Category = require("../models/categoryModel");
const {
  uploadOneImage,
  createUploadFolder,
  deleteUploadImage,
  preventDeletionIfUsed,
} = require("../middleware/helperMiddleware");
const path = require("path");
const categoryDestination = path.join(
  path.dirname(__dirname),
  "./uploads/category"
);
const multer = require("multer");
const CustomError = require("../config/CustomError");
// get related categories
const getRelatedCategories = (categories, parentId = null) => {
  const categoriesList = [];
  let categoryItems;
  if (parentId === null) {
    categoryItems = categories.filter((item) => item.parentId === "");
  } else {
    categoryItems = categories.filter((item) => item.parentId == parentId);
  }
  categoryItems.forEach((category) => {
    categoriesList.push({
      _id: category._id,
      name: category.name,
      ar_name: category.ar_name,
      parentId: category.parentId,
      image: category.image,
      status: category.status,
      children: getRelatedCategories(categories, category._id),
    });
  });
  return categoriesList;
};

//add new category
const addCategory = async (req, res, next) => {
  try {
    //create category upload brand
    createUploadFolder(categoryDestination);
    const uploadCategoryImage = uploadOneImage(categoryDestination, "category");
    let categoryImage = "";
    let categoryImagePath = "";
    uploadCategoryImage(req, res, async (err) => {
      const { name, ar_name, parentId, status } = req.body;
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ msg: `instanceof ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ msg: err.message });
      } else {
        // Everything went fine.
        if (req.file) {
          categoryImage = `${process.env.URL}/category/${req.file.filename}`;
          categoryImagePath = `${categoryDestination}/${req.file.filename}`;
        } else {
          categoryImage = "";
        }
        const exsistCategory = await Category.findOne({ name }).exec();
        //check if category is exsist
        if (exsistCategory) {
          if (req.file) {
            deleteUploadImage(categoryImagePath);
          }
          return next(new CustomError("This category is already exsist", 400));
        }
        // check name or ar_name for brand
        if (!name || !ar_name) {
          if (req.file) {
            deleteUploadImage(categoryImagePath);
          }
          return next(new CustomError("name and ar_name is required", 400));
        }
        // create new category
        const newCategory = await Category.create({
          name,
          ar_name,
          parentId: parentId ? parentId : "",
          image: categoryImage,
          status,
        });
        if (newCategory !== null) {
          const _newNecategory = await Category.findOne({
            _id: newCategory._id,
          }).exec();
          return res.status(201).json({ category: _newNecategory });
        } else {
          return next(new CustomError("some thing wronge!", 400));
        }
      }
    });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
// update category
const updateCategory = async (req, res, next) => {
  //check category folder is exsist or created
  createUploadFolder(categoryDestination);
  // upload brand image
  const updatedUploadCategoryImage = uploadOneImage(
    categoryDestination,
    "category"
  );
  updatedUploadCategoryImage(req, res, async (err) => {
    const { id } = req.params;
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ msg: `instanceof ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ msg: err.message });
    } else {
      // Everything went fine.
      //find category
      const category = await Category.findOne({ _id: id }).exec();
      let newCategoryImage = "";
      if (req.file) {
        newCategoryImage = `${process.env.URL}/category/${req.file.filename}`;
      }
      if (category) {
        if (category.image !== "") {
          const ocategoryImage = category.image.split("/").pop();
          if (req.file) {
            // delete old image
            deleteUploadImage(`${categoryDestination}/${ocategoryImage}`);
          } else {
            newCategoryImage = category.image;
          }
        }
        req.body.image = newCategoryImage;
        const updatedCategory = await Category.findOneAndUpdate(
          { _id: id },
          req.body,
          { new: true, upsert: true, runValidators: true }
        );
        return res.status(200).json({ category: updatedCategory });
      } else {
        // delete upload image
        if (req.file) {
          deleteUploadImage(`${categoryDestination}/${req.file.filename}`);
        }
        return next(new CustomError("This category is not exsist", 400));
      }
    }
  });
};
//delete one category
const deleteOneCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).exec();
    if (!category) {
      return next(new CustomError(`This ${req.params.id} is not exsist`, 400));
    }
    await preventDeletionIfUsed(category, "category");
    const deletedCategory = await Category.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    if (deletedCategory) {
      if (deletedCategory.image !== "") {
        deleteUploadImage(
          `${categoryDestination}/${deletedCategory.image.split("/").pop()}`
        );
      }
      return res.status(200).json({ id: deletedCategory._id });
    } else {
      return next(new CustomError("This category is not exsist", 400));
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
// delete categories
const deleteManyCategories = async (req, res, next) => {
  try {
    const { categoriesIds } = req.body;
    let deletedCategoeries = [];
    if (categoriesIds.length === 0) {
      return next(new CustomError("No category Selectedt", 400));
    } else {
      for (let i = 0; i < categoriesIds.length; i++) {
        const cateId = categoriesIds[i];
        const category = await Category.findById(cateId).exec();
        if (!category) {
          return next(new CustomError(`This ${cateId} is not exsist`, 400));
        }
        await preventDeletionIfUsed(category, "category");
        const deletedCate = await Category.findOneAndDelete({
          _id: cateId,
        }).exec();
        if (deletedCate) {
          if (deletedCate.image !== "") {
            deleteUploadImage(
              `${categoryDestination}/${deletedCate.image.split("/").pop()}`
            );
          }
        } else {
          return next(new CustomError(`This ${cateId} is not exsist`, 400));
        }
        deletedCategoeries = [...deletedCategoeries, deletedCate];
      }
      if (categoriesIds.length === deletedCategoeries.length) {
        return res
          .status(200)
          .json({ msg: "Category successful deleted", ids: categoriesIds });
      }
    }
  } catch (error) {
    return next(new CustomError(error, 400));
  }
};
const fetchCategories = async (req, res) => {
  const categories = await Category.find({}).exec();
  if (categories.length > 0) {
    return res.status(200).json({
      categories: categories,
      categoriesList: getRelatedCategories(categories),
    });
  } else {
    return res.status(404).json({
      categories: [],
      categoriesList: [],
      msg: "No categories founded",
    });
  }
};
module.exports = {
  addCategory,
  updateCategory,
  deleteManyCategories,
  fetchCategories,
  deleteOneCategory,
};
