const express = require("express");
const Booking = require("../models/Booking");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// POST /api/bookings — anyone can book a class from the public schedule page
router.post("/", async (req, res) => {
  try {
    const { name, email, program, day, date, time } = req.body;
    if (!name || !email || !program || !day || !date || !time) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }
    const booking = await Booking.create({ name, email, program, day, date, time });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: "Could not create booking", detail: err.message });
  }
});

// GET /api/bookings — admin/md only, for the admin panel's bookings table
router.get("/", requireAuth, requireRole("admin", "md"), async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

module.exports = router;
