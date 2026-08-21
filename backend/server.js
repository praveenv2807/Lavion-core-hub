require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/members");
const bookingRoutes = require("./routes/bookings");

const app = express();

app.use(cors());
app.use(express.json());

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, dbState: mongoose.connection.readyState }); // 1 = connected
});

// --- Serve the actual website (the folder one level up from /backend) ---
const SITE_DIR = path.join(__dirname, "..");
app.use(express.static(SITE_DIR));

// --- Connect to MongoDB, then start the server ---
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✓ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✓ Server running at http://localhost:${PORT}`);
      console.log(`  (this now serves the whole site — you don't need Live Server anymore)`);
    });
  })
  .catch((err) => {
    console.error("✗ Could not connect to MongoDB:");
    console.error("  " + err.message);
    console.error("  Check backend/.env — is MONGO_URI set correctly?");
    process.exit(1);
  });
