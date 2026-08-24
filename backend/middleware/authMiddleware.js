import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = async(req,res,next)=>{

try{

const token = req.headers.authorization?.split(" ")[1];


if(!token){
return res.status(401).json({
message:"No token"
});
}


const decoded = jwt.verify(
token,
process.env.JWT_SECRET || "secretkey"
);


const user = await User.findById(decoded.id)
.select("-password");


if(!user){
return res.status(401).json({
message:"User not found"
});
}


req.user=user;

next();


}catch(error){

res.status(401).json({
message:"Unauthorized"
});

}

};