const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    plan: { type: String, enum: ["Floor Access", "Coached", "All Access"], default: "Floor Access" },
    status: { type: String, enum: ["active", "pending"], default: "pending" },
  },
  { timestamps: true } // createdAt doubles as "joined" date
);

module.exports = mongoose.model("Member", memberSchema);
