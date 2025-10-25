/**
 * Create Default Admin User Script
 * Run this once to create the default admin account
 * Usage: tsx server/createAdmin.ts
 */

import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function createDefaultAdmin() {
  try {
    const email = "admin@valifi.com";
    const password = "Admin@123"; // Change this password after first login!
    const firstName = "Admin";
    const lastName = "User";

    console.log("Creating default admin user...");

    // Check if admin already exists
    const existingUser = await storage.getUserByEmail(email);

    if (existingUser) {
      console.log("Admin user already exists!");
      console.log(`Email: ${existingUser.email}`);
      console.log(`Admin Status: ${existingUser.isAdmin}`);

      // If user exists but is not admin, update to admin
      if (!existingUser.isAdmin) {
        console.log("Promoting existing user to admin...");
        await storage.updateUserStatus(existingUser.id, true);
        console.log("✓ User promoted to admin successfully!");
      }

      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await storage.upsertUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      profileImageUrl: "",
      isAdmin: true,
    });

    console.log("\n✓ Default admin user created successfully!");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin@valifi.com");
    console.log("🔑 Password: Admin@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANT: Change this password after first login!\n");

    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

// Run the script
createDefaultAdmin()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
