const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    program: { type: String, required: true }, // e.g. "Strength Forge"
    day: { type: String, required: true },      // e.g. "Mon"
    date: { type: String, required: true },     // e.g. "Jul 10"
    time: { type: String, required: true },     // e.g. "06:00"
    status: { type: String, enum: ["confirmed", "pending", "cancelled"], default: "confirmed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
