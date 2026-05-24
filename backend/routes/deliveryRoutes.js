import express from "express";
import Delivery from "../models/delivery.js";

const router = express.Router();
import { verifyToken } from "../middleware/auth.js";

// Create
router.post("/", verifyToken, async (req, res) => {
  try {
    const { deliveryName, deliveryPhone, deliveryStatus, deliveryCar } =
      req.body;

    const newDelivery = await Delivery.create({
      deliveryName,
      deliveryPhone,
      deliveryStatus,
      deliveryCar,
    });
    return res.status(201).json({
      message: "Delivery created successfully",
      data: newDelivery,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Delivery with this phone already exists",
      });
    }
    return res.status(500).json({
      error: error.message || "Failed to create delivery",
    });
  }
});

// Read All
router.get("/", verifyToken, async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      order: [["deliveryId", "DESC"]],
    });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    await delivery.update(req.body);
    return res.status(201).json({
      message: "Delivery update successfully",
      data: delivery,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Delivery with this phone already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update delivery",
    });
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    await delivery.destroy();
    return res.status(201).json({
      message: "Delivery deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete delivery",
    });
  }
});

export default router;
