import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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


    // Only customers can self-register.
    // Employees are created by admin via POST /users/employees.
    // Admins are seeded directly — never via public register.
    if (role && role !== "customer") {
      return res.status(403).json({
        message: "You cannot register with this role"
      });
    }


    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer",
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


    const normalizedEmail = email.trim().toLowerCase();

    const userDoc = await User.findOne({ email: normalizedEmail });

    // Admin/employee: authenticate strictly against their own User password.
    // Never fall back to the Customer collection for these roles.
    if (userDoc && (userDoc.role === "admin" || userDoc.role === "employee")) {

      const match = await bcrypt.compare(password, userDoc.password);

      if (!match) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

      return res.json({
        token: generateToken(userDoc),
        user: {
          id: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          location: userDoc.location,
          region: userDoc.region
        }
      });

    }

    // Customer path: a customer-role User may already exist for this email.
    let user = userDoc && userDoc.role === "customer" ? userDoc : null;

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return res.json({
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
      }
      // Password on the User account didn't match — fall through and check
      // the legacy Customer record before giving up. This covers a stale
      // User password (or an unlinked customer:null account) where the
      // authoritative password actually lives on Customer.
    }

    // Legacy fallback: a Customer record (e.g. created directly via
    // addCustomer, without ever going through createPortalLogin) may hold
    // its own password. Customer.email has no lowercase setter, so existing
    // records may be stored with mixed case — match case-insensitively.
    const customer = await Customer.findOne({
      email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: "i" }
    });

    if (!customer || !customer.password) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const customerMatch = await bcrypt.compare(password, customer.password);

    if (!customerMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    if (user) {

      // Repair the existing customer User account instead of creating a
      // duplicate: link it to the Customer record and sync only safe,
      // non-sensitive identity fields. Password is left as-is.
      let dirty = false;

      if (String(user.customer || "") !== String(customer._id)) {
        user.customer = customer._id;
        dirty = true;
      }
      if (customer.name && user.name !== customer.name) {
        user.name = customer.name;
        dirty = true;
      }
      if (customer.location !== undefined && user.location !== customer.location) {
        user.location = customer.location;
        dirty = true;
      }
      if (customer.region !== undefined && user.region !== customer.region) {
        user.region = customer.region;
        dirty = true;
      }

      if (dirty) {
        await user.save();
      }

    } else {

      // Guard against a duplicate: this customer may already have a linked
      // User under a different email casing/value.
      user = await User.findOne({ customer: customer._id });

      if (!user) {
        user = await User.create({
          name: customer.name,
          email: normalizedEmail,
          password: customer.password, // already bcrypt-hashed, reused as-is
          role: "customer",
          location: customer.location,
          region: customer.region,
          customer: customer._id
        });
      }

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