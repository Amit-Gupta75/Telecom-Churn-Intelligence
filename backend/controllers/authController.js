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


export const register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
      location,
      region
    } = req.body;


    if (!name || !email || !password) {

      return res.status(400).json({
        message: "name, email and password are required"
      });

    }


    if (password.length < 6) {

      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });

    }


    const allowedRoles = ["customer", "employee", "admin"];

    if (role && !allowedRoles.includes(role)) {

      return res.status(400).json({
        message: "Invalid role"
      });

    }


    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      location,
      region
    });


    res.json({
      message: "Registration successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        region: user.region
      }
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



export const login = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    if (!email || !password) {

      return res.status(400).json({
        message: "email and password are required"
      });

    }


    const user = await User.findOne({ email });


    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }


    const match = await bcrypt.compare(
      password,
      user.password
    );


    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }



    res.json({

      token: generateToken(user),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        region: user.region
      }

    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



export const getMe = async (req, res) => {

  res.json({
    user: req.user
  });

};