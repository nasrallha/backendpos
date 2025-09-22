;
const jwt = require("jsonwebtoken");

const jwtPrivateKey =  process.env.JWT_SCREET
//check user is authonticated
const isAuth = (req,res,next)=>{
    let token="";
   // get token form headers && spilt it Bearer
   if(req.headers.authorization && req.headers.authorization.startsWith("Beare")){
        token = req.headers.authorization.split(' ')[1];
   };
   // check token
   if(!token){
    return res.status(401).json({msg:'No token Authorized'});
   }else{
    // verify token
    jwt.verify(token, jwtPrivateKey,(err, decoded)=>{
        if(err){
            return res.status(401).json({msg:"token expired Please Login Again"})
        }else{
            req.user = decoded;
            next();
        }
      });
   }
};
//check user is Authorized to create
const isAuthorizedToCreate = (req,res,next)=>{
    const role = req.user.role;
    if(role ==="supper admin" || role ==="admin" || role ==="manger" ){
        next();
    }else{
        return res.status(403).json({msg:"This user is not allowed to make insertes."}) 
    }
};
//check user is Authorized to update
const isAuthorizedToUpdate = (req,res,next)=>{
    const role = req.user.role;
    if(role ==="supper admin" || role ==="admin" || role ==="manger" ){
        next();
    }else{
        return res.status(403).json({msg:"This user is not allowed to make edits."}) 
    }
};
//check user is Authorized to delete
const isAuthorizedToDelete = (req,res,next)=>{
    const role = req.user.role;
    if(role ==="supper admin" || role ==="admin" ){
        next();
    }else{
        return res.status(403).json({msg:"This user is not allowed to make deletes."}) 
    }
};


module.exports = {
    isAuth,
    isAuthorizedToCreate,
    isAuthorizedToUpdate,
    isAuthorizedToDelete,
};
