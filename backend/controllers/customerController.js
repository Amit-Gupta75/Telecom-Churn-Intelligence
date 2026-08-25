import Customer from "../models/Customer.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const listCustomers = async (_req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addCustomer = async(req,res)=>{

try{

const hashedPassword = await bcrypt.hash(
    req.body.password,
    10
);


const customer = await Customer.create({

name:req.body.name,

email:req.body.email,

phone:req.body.phone,

password:hashedPassword,

location:req.body.location,

role:"customer",

tenure:0,

monthlyCharges:0,

totalCharges:0,

contract:"Month-to-month"

});


res.json(customer);


}catch(error){

res.status(500).json({
message:error.message
});

}

};
export const removeCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCustomer = async(req,res)=>{

    try{

        const customer =
        await Customer.findByIdAndDelete(req.params.id);


        if(!customer){

            return res.status(404).json({
                message:"Customer not found"
            });

        }


        res.json({
            message:"Customer deleted successfully"
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

// GET /api/customers/me — the logged-in customer's own record
export const getMyProfile = async (req, res) => {
  try {

    if (!req.user.customer) {
      return res.status(404).json({
        message: "No customer profile linked to this account yet"
      });
    }

    const customer = await Customer.findById(req.user.customer);

    if (!customer) {
      return res.status(404).json({
        message: "Linked customer record not found"
      });
    }

    res.json(customer);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// PATCH /api/customers/me — the logged-in customer updates their own
// contact details. Restricted to non-sensitive fields only; email, role,
// billing and churn data can't be touched through this endpoint.
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;

    const customer = await Customer.findByIdAndUpdate(req.user._id, updates, {
      new: true
    }).select("-password");

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/customers/me/password — the logged-in customer changes their
// own password after verifying the current one.
export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer || !customer.password) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const match = await bcrypt.compare(currentPassword, customer.password);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/customers/:id/portal-login — admin only. Creates a "customer"
// role login and links it to this Customer record so they can sign in
// and see their own profile / churn prediction.
export const createPortalLogin = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "A login with this email already exists" });
    }

    const alreadyLinked = await User.findOne({ customer: customer._id });
    if (alreadyLinked) {
      return res.status(400).json({ message: "This customer already has a portal login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: customer.name,
      email,
      password: hashedPassword,
      role: "customer",
      location: customer.location,
      customer: customer._id
    });

    res.status(201).json({
      message: "Portal login created successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req,res)=>{
    try {

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true
            }
        );


        if(!customer){
            return res.status(404).json({
                message:"Customer not found"
            });
        }


        res.json(customer);


    } catch(error){

        console.log(error);

        res.status(500).json({
            message:"Update failed"
        });

    }
};