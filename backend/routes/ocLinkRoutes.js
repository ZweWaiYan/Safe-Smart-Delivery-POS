import express from "express";
import OcLink from "../models/ocLink.js";
import Op from "sequelize";

const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    const ocLink = await OcLink.create(req.body);
    res.status(201).json(ocLink);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch OcLink" });
  }
});

// Read
router.get("/", async (req, res) => {
  try {
    const ocLink = await OcLink.findAll();
    res.json(ocLink);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const ocLink = await OcLink.findByPk(req.params.id);
    if (!ocLink) {
      return res.status(404).json({ error: "OcLink not found" });
    }
    await ocLink.update(req.body);
    res.json(ocLink);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ocLink = await OcLink.findByPk(id);
    if (!ocLink) {
      return res.status(404).json({ error: "OcLink not found" });
    }
    await ocLink.destroy();
    res.status(200).json({ message: "OcLink deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
