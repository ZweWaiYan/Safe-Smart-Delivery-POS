import express from "express";
import User from "../models/user.js";
import Route from "../models/route.js";
import Op from "sequelize";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.create(req.body);

    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "User with this phone already exists",
      });
    }
    return res.status(500).json({
      error: error.message || "Failed to create user",
    });
  }
});

// Read
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Route,
          attributes: [
            "routeId",
            "userId",
            "pageRoute",
            "canView",
            "canAdd",
            "canEdit",
            "canDelete",
          ],
        },
      ],
      attributes: [        
        "userId",
        "userName",
        "userPhone",
        "userPosition",
        "userPassword",
      ],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update(req.body);
    return res.status(201).json({
      message: "User update successfully",
      data: user,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "User with this phone already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update user",
    });
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.destroy();
    return res.status(201).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete user",
    });
  }
});

export default router;
