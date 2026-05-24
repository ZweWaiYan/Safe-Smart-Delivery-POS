import express from "express";
import Op from "sequelize";
import Market from "../models/market.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", verifyToken, async (req, res) => {
  try {
    const market = await Market.create(req.body);

    return res.status(201).json({
      message: "Market created successfully",
      data: market,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Market is already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to create market",
    });
  }
});

// Read
router.get("/", verifyToken, async (req, res) => {
  try {
    const markets = await Market.findAll({
      order: [["marketId", "DESC"]],
    });
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const market = await Market.findByPk(req.params.id);
    if (!market) {
      return res.status(404).json({ error: "Market not found" });
    }
    await market.update(req.body);
    return res.status(201).json({
      message: "Market update successfully",
      data: market,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Market is already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update market",
    });
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const market = await Market.findByPk(id);
    if (!market) {
      return res.status(404).json({ error: "Market not found" });
    }
    await market.destroy();
    return res.status(201).json({
      message: "Market deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete market",
    });
  }
});

export default router;
