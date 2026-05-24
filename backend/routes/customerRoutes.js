import express from "express";
import Customer from "../models/customer.js";
import Op from "sequelize";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", verifyToken, async (req, res) => { 
  try {
    const customer = await Customer.create(req.body);

    return res.status(201).json({
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to create Customer",
      details: error.errors ? error.errors.map(e => e.message) : "No specific details"
    });
  }
});

// Read
router.get("/", verifyToken, async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [["customerId", "DESC"]],
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    await customer.update(req.body);
    return res.status(201).json({
      message: "Customer update successfully",
      data: customer,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Customer with this phone already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update customer",
    });
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    await customer.destroy();
    return res.status(201).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete customer",
    });
  }
});

export default router;
