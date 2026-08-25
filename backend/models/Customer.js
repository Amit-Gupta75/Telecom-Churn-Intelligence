import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
{
name: { 
  type: String, 
  required: true 
},

location: { 
  type: String, 
  default: "" 
},

region: {
  type: String,
  default: ""
},

tenure: { 
  type: Number, 
  default: 0 
},

monthlyCharges: { 
  type: Number, 
  default: 0 
},

password:{
  type:String,
  required:false
},

role:{
 type:String,
 default:"customer"
},

totalCharges: { 
  type: Number, 
  default: 0 
},

contract: { 
  type: String, 
  default: "Month-to-month" 
},

internetService: { 
  type: String, 
  default: "Fiber optic" 
},

paymentMethod: { 
  type: String, 
  default: "Electronic check" 
},

techSupport: { 
  type: String, 
  default: "No" 
},

onlineSecurity: { 
  type: String, 
  default: "No" 
},

onlineBackup: { 
  type: String, 
  default: "No" 
},

deviceProtection: { 
  type: String, 
  default: "No" 
},

streamingTV: { 
  type: String, 
  default: "No" 
},

streamingMovies: { 
  type: String, 
  default: "No" 
},

paperlessBilling: { 
  type: String, 
  default: "Yes" 
},

gender: { 
  type: String, 
  default: "Female" 
},

seniorCitizen: { 
  type: String, 
  default: "0" 
},

partner: { 
  type: String, 
  default: "No" 
},

dependents: { 
  type: String, 
  default: "No" 
},

multipleLines: { 
  type: String, 
  default: "No" 
},

churnProbability: { 
  type: Number, 
  default: null 
},

email:{
 type:String,
 unique:true,
 sparse:true
},

phone:{
 type:String,
 default:""
},

assignedEmployee:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"User",
 default:null
},

},
{ 
timestamps: true 
}
);

export default mongoose.model("Customer", customerSchema);