const CustomError = require("../config/CustomError.js");
const Page = require("../models/pageModel.js");
const Permission = require("../models/permissionModel.js");
// get related pages 
const getRelatedPages = (pages, parentId = null) => {
  const pagesList = [];
  let page;
  if (parentId === null) {
    page = pages.filter((p) => p.parentId === "");
  } else {
    page = pages.filter((p) =>p.parentId == parentId);
  }
  page.forEach((p) => {
    pagesList.push({
      _id: p._id,
      name: p.name,
      ar_name: p.ar_name,
      parentId: p.parentId,
      createdDate:p.createdDate,
      createdTime:p.createdTime,
      children: getRelatedPages(pages, p._id),
    });
  });

  return pagesList;
};

//add new page
const addNewPage = async (req, res,next) => {
  const { name, ar_name,parentId,arrangement,navberPage, createdDate, createdTime } = req.body;
  try {
     // check name or ar_name for role
    //  if (!name || !ar_name) {
    //   return res.status(400).json({ msg: " name role and ar_name role is required" });
    // };
    const exsistPage = await Page.findOne({$or:[{name},{ar_name}]  }).exec();
    //check if page is exsist
    if (exsistPage) {
      return next( new CustomError("This page is already exsist",400));
    }
    // create new page
    const newPage = await Page.create({
      name,
      ar_name,
      parentId:parentId? parentId : "",
      arrangement,
      navberPage,
      createdDate,
      createdTime
    });
    if (newPage !== null) {
      const _newPage = await Page.findOne({ _id: newPage._id }).exec();
      return res.status(201).json({ page: _newPage });
    } else {
      return next( new CustomError("some thing wronge!",400));
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
};
// update page
const updatePage = async (req, res) => {
  const { id } = req.params;
  const { name, ar_name ,parentId,arrangement,navberPage} = req.body;
    //find page
    const page = await Page.findOne({ _id: id }).exec();
    if (page) {
      const newPageValue = {
        name,
        ar_name,
        parentId,
        arrangement,
        navberPage
      };
      const updatedPage = await Page.findOneAndUpdate({ _id: id }, newPageValue, { new: true, upsert: true,runValidators:true });
      return res.status(200).json({ page: updatedPage });
    } else {
      return next( new CustomError("This page is not craeted",400));
    }
};
//delete one page
const deleteOnePage = async (req, res,next) => {
  try {
    const deletedPage = await Page.findOneAndDelete({_id:req.params.id}).exec();
    if(deletedPage){
      //delete page  from permissions
      const deletedpagePermissions = await Permission.findOneAndDelete({page:deletedPage._id}).exec();
      return res.status(200).json({id:deletedPage._id});
    }else{
      return next( new CustomError("This page is not exsist",400));
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
};
//delete many pages
const deleteManyPages = async (req, res,next) => {
  const { pagesIds } = req.body;
  let deletedPages = [];
  try {
    if (pagesIds.length === 0) {
      return next( new CustomError("No Pages Selected",400));
    }else{
      for (let i = 0; i < pagesIds.length; i++) {
        const pageId = pagesIds[i];
        const deletedPage = await Page.findOneAndDelete({_id: pageId,}).exec();
        //delete page  from permissions
        const deletedpagePermissions = await Permission.findOneAndDelete({page:deletedPage._id}).exec();
        if (!deletedPage) {
          return next( new CustomError(`This ${pageId} is not exsist`,400));
        }
        deletedPages = [...deletedPages, deletedPage];
      }
      if (pagesIds.length === deletedPages.length) {
        return res.status(200).json({ msg: "Page successful deleted", ids: pagesIds });
      }
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
};
// fetch all pages
const fetchPages = async (req, res,next) => {
  try {
    const pages = await Page.find().sort([["arrangement",1]]).exec();
    if (pages.length > 0) {
      return res.status(200).json({pages});
    } else {
      return res.status(404).json({ pages: [], msg: "No pages founded" });
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
};
// fetch navber pages
const fetchNavberPages = async (req, res,next) => {
  try {
    const pages = await Page.find({navberPage:true}).sort([["arrangement",1]]).exec();
  if (pages.length > 0) {
    return res.status(200).json({pagesList: getRelatedPages(pages)});
  } else {
    return res.status(404).json({pagesList:[], msg: "No pages founded" });
  }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
};
//get one page
const getPage = async(req,res,next)=>{
  const {id} = req.params;
  try {
    if(!id){
      return res.status(400).json({msg:"No page selected"});
    }else{
      const page = await Page.findOne({_id:id}).exec();
      if(page){
        return res.status(200).json({page});
      }else{
        return next( new CustomError("sorry, no page exsist",400));
      }
    }
  } catch (error) {
    return next( new CustomError(error.message,400));
  }
}

module.exports = {
  addNewPage,
  fetchPages,
  fetchNavberPages,
  deleteManyPages,
  deleteOnePage,
  updatePage,
  getPage
};
