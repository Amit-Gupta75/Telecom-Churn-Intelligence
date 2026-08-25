import User from "../models/User.js";
import bcrypt from "bcrypt";


// GET ALL EMPLOYEES
export const getEmployees = async (req,res)=>{

try{

const employees = await User.find({
role:"employee"
})
.select("-password");


res.json(employees);


}catch(error){

res.status(500).json({
message:error.message
});

}

};




// GET SINGLE EMPLOYEE
export const getEmployeeById = async (req,res)=>{

try{

const employee = await User.findOne({
_id:req.params.id,
role:"employee"
})
.select("-password");


if(!employee){

return res.status(404).json({
message:"Employee not found"
});

}


res.json(employee);


}catch(error){

res.status(500).json({
message:error.message
});

}

};




// CREATE EMPLOYEE (ADMIN ONLY)
export const createEmployee = async(req,res)=>{

try{


const {
name,
email,
password,
location,
region
}=req.body;



const existingUser =
await User.findOne({email});


if(existingUser){

return res.status(400).json({
message:"User already exists"
});

}



const hashedPassword =
await bcrypt.hash(password,10);



const employee =
await User.create({

name,

email,

password:hashedPassword,

role:"employee",

location,

region

});



res.status(201).json({

message:"Employee created successfully",

employee:{
id:employee._id,
name:employee.name,
email:employee.email,
role:employee.role,
location:employee.location,
region:employee.region
}

});


}catch(error){

res.status(500).json({
message:error.message
});

}

};




// DELETE EMPLOYEE
export const deleteEmployee = async(req,res)=>{

try{


const employee =
await User.findOneAndDelete({

_id:req.params.id,

role:"employee"

});


if(!employee){

return res.status(404).json({
message:"Employee not found"
});

}


res.json({

message:"Employee deleted successfully"

});


}catch(error){

res.status(500).json({
message:error.message
});

}

};