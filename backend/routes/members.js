const express = require("express");
const Member = require("../models/Member");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/members — list all members (admin/md only)
router.get("/", requireAuth, requireRole("admin", "md"), async (req, res) => {
  const members = await Member.find().sort({ createdAt: -1 });
  res.json(members);
});

// POST /api/members — add a member (admin/md only)
router.post("/", requireAuth, requireRole("admin", "md"), async (req, res) => {
  try {
    const { name, email, plan, status } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
    const member = await Member.create({ name, email, plan, status });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: "Could not add member", detail: err.message });
  }
});

// GET /api/members/count — public-ish count for the homepage stat
// (kept simple/unauthenticated since it's just a number, not sensitive data)
router.get("/count", async (req, res) => {
  const count = await Member.countDocuments();
  res.json({ count });
});

// DELETE /api/members/:id — admin/md only
router.delete("/:id", requireAuth, requireRole("admin", "md"), async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
