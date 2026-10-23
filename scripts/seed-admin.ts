
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/libs/database";
import User from "@/models/user";


async function seedAdmin() {
  try {
    await connectDB();

    const email = "admin@accountflow.com";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists:", email);
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@12345", 12);

    await User.create({
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Mock admin created successfully");
    console.log("Email:", email);
    console.log("Password: Admin@12345");
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
