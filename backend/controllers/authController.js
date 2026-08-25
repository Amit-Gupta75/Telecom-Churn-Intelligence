import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET || "secretkey",
    {
      expiresIn: "7d"
    }
  );
};


export const register = async (req,res)=>{

try{

const {
name,
email,
password,
location,
region
}=req.body;


const existing = await User.findOne({email});

if(existing){
return res.status(400).json({
message:"User already exists"
});
}


const hashedPassword = await bcrypt.hash(password,10);


// Public registration always creates a "customer" role account.
// Admin and employee accounts can only be created through the
// protected /api/users/employees routes — role is never trusted
// from the request body here.
const user = await User.create({
name,
email,
password:hashedPassword,
role: "customer",
location,
region
});


res.json({
message:"Registration successful",
token:generateToken(user),
user:{
id:user._id,
name:user.name,
email:user.email,
role:user.role,
location:user.location,
region:user.region,
customer:user.customer
}
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};



export const login = async(req,res)=>{

try{

const {
email,
password
}=req.body;


// First check User collection

let account = await User.findOne({email});




// If not found check Customer collection
if(!account){

account = await Customer.findOne({email});


}


if(!account){

return res.status(401).json({
message:"Invalid credentials"
});

}



const match = await bcrypt.compare(
password,
account.password
);



if(!match){

return res.status(401).json({
message:"Invalid credentials"
});

}





res.json({

token:generateToken(account),

user:{

id:account._id,

name:account.name,

email:account.email,

role:account.role,

location:account.location,

region:account.region

}

});


}catch(error){

res.status(500).json({
message:error.message
});

}

};


export const getMe = async(req,res)=>{

res.json({
user:req.user
});

};