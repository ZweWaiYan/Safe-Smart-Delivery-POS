import express from "express";
import DeliAreaTownShip from "../models/deliAreaTownShip.js";
import Op from "sequelize";
import { verifyToken } from "../middleware/auth.js";

// Read
router.get("/", verifyToken , async (req, res) => {
  try {
    const deliAreaTownShips = await DeliAreaTownShip.findAll();
    res.json(deliAreaTownShips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});