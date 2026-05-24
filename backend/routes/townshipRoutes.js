import express from "express";
import Township from "../models/township.js";
import Op from "sequelize";

const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    const township = await Township.create(req.body);

    return res.status(201).json({
      message: "Township created successfully",
      data: township,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "This Township already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to create Township",
    });
  }
});

// Read
router.get("/", async (req, res) => {
  try {
    const townships = await Township.findAll({
      order: [["townShipId", "DESC"]],
    });
    res.json(townships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const township = await Township.findByPk(req.params.id);
    if (!township) {
      return res.status(404).json({ error: "Township not found" });
    }
    await township.update(req.body);
    return res.status(201).json({
      message: "Township update successfully",
      data: township,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "This Township already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update Township",
    });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const township = await Township.findByPk(id);
    if (!township) {
      return res.status(404).json({ error: "Township not found" });
    }
    await township.destroy();
    return res.status(201).json({
      message: "Township deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete Township",
    });
  }
});

export default router;
