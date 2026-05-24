import express from "express";
import Route from "../models/route.js";
import Op from "sequelize";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", verifyToken, async (req, res) => {

  const { userId } = req.body;
  
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Build the 9 route objects
    const routesArray = [];
    for (let i = 1; i <= 9; i++) {
      routesArray.push({
        userId,
        pageRoute: i,
        canView: 0,
        canAdd: 0,
        canEdit: 0,
        canDelete: 0,
      });
    }

    // Insert all rows at once
    const routes = await Route.bulkCreate(routesArray, {
      validate: true,
      ignoreDuplicates: true
      // conflictFields: ["userId", "pageRoute"], // Use this for PostgreSQL
    });

    return res.status(201).json({
      message: "Routes created successfully",
      data: routes,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Some routes already exist" });
    }

    return res.status(500).json({
      error: error.message || "Failed to create routes",
    });
  }
});

// Read
router.get("/", verifyToken, async (req, res) => {
  try {
    const route = await Route.findAll();
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read routes for a specific user
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const routes = await Route.findAll({ where: { userId } });

    if (routes.length === 0) {
      return res.status(200).json({
        message: "No routes found for this user",
        data: [],
      });
    }

    return res.status(200).json({
      message: "User routes fetched successfully",
      data: routes,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    await route.update(req.body);
    return res.status(201).json({
      message: "Route update successfully",
      data: route,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Route with this phone already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update route",
    });
  }
});

// Delete
router.delete("/user/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    const deletedCount = await Route.destroy({
      where: { userId: userId },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "No routes found for this user" });
    }

    return res.status(200).json({
      message: "All routes deleted successfully",
      deleted: deletedCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to delete routes",
    });
  }
});


export default router;
