import express from "express";
import DeliArea from "../models/deliArea.js";
import TownShip from "../models/township.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//Create
router.post("/", verifyToken, async (req, res) => {
  try {
    const { deliCarNo, deliCarTownShip } = req.body;

    if (!deliCarNo) {
      return res.status(400).json({ error: "deliCarNo is required" });
    }

    const area = await DeliArea.create({ deliCarNo });

    if (Array.isArray(deliCarTownShip) && deliCarTownShip.length > 0) {
      await area.addTownShips(deliCarTownShip);
    }

    // Fetch the townships again after linking
    const townShips = await area.getTownShips({
      attributes: ["townShipId", "townShipName"],
    });

    res.status(201).json({
      message: "Deli Car created successfully",
      data: {
        deliAreaId: area.deliAreaId,
        deliCarNo: area.deliCarNo,
        townShipIds: townShips.map((t) => t.townShipId),
        townShipNames: townShips.map((t) => t.townShipName),
      },
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: "Failed to create Deli Car" });
  }
});

//Read
router.get("/", verifyToken, async (req, res) => {
  try {
    const areas = await DeliArea.findAll({
      order: [["deliAreaId", "DESC"]],
      include: {
        model: TownShip,
        attributes: ["townShipId", "townShipName"],
      },
    });

    return res.json(
      areas.map((area) => ({
        deliAreaId: area.deliAreaId,
        deliCarNo: area.deliCarNo,
        townShipIds: area.TownShips.map((t) => t.townShipId),
        townShipNames: area.TownShips.map((t) => t.townShipName),
      }))
    );
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: "Failed to fetch Deli Areas" });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { deliCarNo, deliCarTownShip } = req.body;

    const deliArea = await DeliArea.findByPk(req.params.id);
    if (!deliArea) {
      return res.status(404).json({ error: "Deli Car not found" });
    }

    // Update DeliArea basic info
    if (deliCarNo) {
      deliArea.deliCarNo = deliCarNo;
      await deliArea.save();
    }

    // Update related TownShips (reset associations)
    if (Array.isArray(deliCarTownShip)) {
      await deliArea.setTownShips(deliCarTownShip);
      // setTownShips replaces existing ones with the new array
    }

    // Fetch updated associations
    const townShips = await deliArea.getTownShips({
      attributes: ["townShipId", "townShipName"],
    });

    res.status(201).json({
      message: "Deli Car updated successfully",
      data: {
        deliAreaId: deliArea.deliAreaId,
        deliCarNo: deliArea.deliCarNo,
        townShipIds: townShips.map((t) => t.townShipId),
        townShipNames: townShips.map((t) => t.townShipName),
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "This Deli Car is already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to update Deli Car",
    });
  }
});

//Delete
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await DeliArea.destroy({
      where: { deliAreaId: Number(id) },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Deli Area not found" });
    }

    res.status(201).json({ message: "Deli Area deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete Deli Area" });
  }
});

export default router;
