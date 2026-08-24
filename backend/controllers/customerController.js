import Customer from "../models/Customer.js";

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

export const addCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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