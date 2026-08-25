import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    let user;

    // Customer accounts are stored in Customer collection.
    if (decoded.role === "customer") {
      user = await Customer.findById(decoded.id)
        .select("-password");

      if (!user) {
        return res.status(401).json({
          message: "Customer not found"
        });
      }

      // Keep the role available to authorize()
      user = {
        ...user.toObject(),
        role: "customer"
      };
    } else {
      // Admin / employee accounts are stored in User collection.
      user = await User.findById(decoded.id)
        .select("-password");

      if (!user) {
        return res.status(401).json({
          message: "User not found"
        });
      }
    }

    req.user = user;

    console.log("PROTECT DEBUG:", {
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role
    });

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Unauthorized"
    });
  }
};