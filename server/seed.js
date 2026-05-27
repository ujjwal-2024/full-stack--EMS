import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

const TEMPORARY_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function registerAdmin() {
  try {
    await connectDB();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (!ADMIN_EMAIL) {
      console.error("Missing ADMIN_EMAIL in .env");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash(TEMPORARY_PASSWORD, 10);
    await User.create({ email: ADMIN_EMAIL, password: hashed, role: "ADMIN" });

    console.log("✅ Admin created successfully");
    console.log("Email:   ", ADMIN_EMAIL);
    console.log("Password:", TEMPORARY_PASSWORD);

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

registerAdmin();