import express from "express";
import Outlet from "../models/outlet.js";
import Op from "sequelize";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", verifyToken, async (req, res) => {
  try {
    const outlet = await Outlet.create(req.body);
    return res.status(201).json({
      message: "Outlet created successfully",
      data: outlet,
    });
  } catch (error) {
    // if (error.name === "SequelizeUniqueConstraintError") {
    //   return res.status(400).json({
    //     error: "Outlet with this phone already exists",
    //   });
    // }
    return res.status(500).json({
      error: error.message || "Failed to create outlet",
    });
  }
});

// Read
router.get("/", verifyToken, async (req, res) => {
  try {
    const outlets = await Outlet.findAll({
      order: [["outletId", "DESC"]],
    });
    res.json(outlets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const outlet = await Outlet.findByPk(req.params.id);
    if (!outlet) {
      return res.status(404).json({ error: "Outlet not found" });
    }
    await outlet.update(req.body);
    return res.status(201).json({
      message: "Outlet update successfully",
      data: outlet,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Outlet with this phone already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update outlet",
    });
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const outlet = await Outlet.findByPk(id);
    if (!outlet) {
      return res.status(404).json({ error: "Outlet not found" });
    }
    await outlet.destroy();
    return res.status(201).json({
      message: "Outlet deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete outlet",
    });
  }
});

export default router;
