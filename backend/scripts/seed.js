// Run this once after setting up your .env: npm run seed
// Creates (or updates) the fixed Admin and MD accounts with properly hashed passwords.
// This is what replaces the old "hardcoded password visible in JS" approach —
// the real password only ever exists in your .env file, never in code that ships to the browser.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("✗ MONGO_URI is not set. Copy .env.example to .env and fill it in first.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ Connected to MongoDB");

  const accounts = [
    { name: "Admin", email: "admin@lavioncorehub.demo", password: process.env.ADMIN_PASSWORD || "1234", role: "admin" },
    { name: "Managing Director", email: "md@lavioncorehub.demo", password: process.env.MD_PASSWORD || "changeme", role: "md" },
  ];

  for (const acc of accounts) {
    const passwordHash = await bcrypt.hash(acc.password, 10);
    const existing = await User.findOne({ email: acc.email });
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = acc.role;
      existing.name = acc.name;
      await existing.save();
      console.log(`✓ Updated existing account: ${acc.email} (${acc.role})`);
    } else {
      await User.create({ name: acc.name, email: acc.email, passwordHash, role: acc.role });
      console.log(`✓ Created account: ${acc.email} (${acc.role})`);
    }
  }

  console.log("\nDone. Log in on the site with:");
  accounts.forEach((a) => console.log(`  ${a.role.toUpperCase()}: ${a.email} / (the password from your .env)`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err.message);
  process.exit(1);
});
