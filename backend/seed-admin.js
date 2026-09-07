/**
 * seed-admin.js
 * -------------
 * One-time script to create the first admin account.
 * Run once manually:  node seed-admin.js
 * Never expose this as an API endpoint.
 *
 * Usage:
 *   MONGO_URI=<your-atlas-uri> node seed-admin.js
 *   or just: node seed-admin.js  (reads from .env)
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const ADMIN = {
  name:     "Super Admin",
  email:    "admin@telecom.com",
  password: "Admin@123",   // change this after first login
  role:     "admin",
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const existing = await User.findOne({ email: ADMIN.email });

  if (existing) {
    console.log(`Admin already exists: ${ADMIN.email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN.password, 10);
  await User.create({ ...ADMIN, password: hashed });

  console.log(`Admin created → email: ${ADMIN.email}  password: ${ADMIN.password}`);
  console.log("Change the password after first login!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
