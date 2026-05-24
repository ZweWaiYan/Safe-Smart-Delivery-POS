import express from "express";
import way from "../models/way.js";
import customer from "../models/customer.js";
import outlet from "../models/outlet.js";
import deliArea from "../models/deliArea.js";
import Sequelize from "../config/db.js";
import townShip from "../models/township.js";
import { verifyToken } from "../middleware/auth.js";
import { Op } from "sequelize";

import { Way, Customer, Outlet, DeliArea, TownShip } from "../models/index.js";

const router = express.Router();

// Read
router.get("/", verifyToken, async (req, res) => {
  try {
    const list = await Way.findAll({
      order: [["wayId", "DESC"]],
      attributes: [
        "wayId",
        "outletId",
        "customerId",
        "itemPrice",
        "deliFee",
        "status",
        "itemQty",
        "wayType",
        "marketId",
        "marketName",
        "pickupDeliCar",
        "senderDeliCar",
        "city",
        "remark",
        "complaint",
        "townShipId",
        "wayDate",
        "updatedDate",
        [Sequelize.col("pickupDeliCarArea.deliCarNo"), "pickupDeliCarNo"],
        [Sequelize.col("senderDeliCarArea.deliCarNo"), "senderDeliCarNo"],
        [Sequelize.col("townshipData.townshipName"), "townshipName"],
      ],
      include: [
        {
          model: customer,
          attributes: ["customerName", "customerPhone", "customerAddress"],
        },
        {
          model: outlet,
          attributes: [
            "outletName",
            "outletPhone",
            "outletAddress",
            "outletType",
          ],
        },
        {
          model: DeliArea,
          as: "pickupDeliCarArea",
          attributes: [],
        },
        {
          model: DeliArea,
          as: "senderDeliCarArea",
          attributes: [],
        },
        {
          model: townShip,
          as: "townshipData",
          attributes: [],
        },
      ],
    });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch way list" });
  }
});

// Create
router.post("/", verifyToken, async (req, res) => {
  try {
    const newWay = await way.create(req.body);
    const newWayWithAssociations = await Way.findByPk(newWay.wayId, {
      attributes: [
        "wayId",
        "outletId",
        "customerId",
        "itemPrice",
        "deliFee",
        "status",
        "itemQty",
        "wayType",
        "marketId",
        "marketName",
        "pickupDeliCar",
        "senderDeliCar",
        "city",
        "remark",
        "complaint",
        "townShipId",
        "wayDate",        
        [Sequelize.col("pickupDeliCarArea.deliCarNo"), "pickupDeliCarNo"],
        [Sequelize.col("senderDeliCarArea.deliCarNo"), "senderDeliCarNo"],
        [Sequelize.col("townshipData.townshipName"), "townshipName"],
      ],
      include: [
        {
          model: customer,
          attributes: ["customerName", "customerPhone", "customerAddress"],
        },
        {
          model: outlet,
          attributes: [
            "outletName",
            "outletPhone",
            "outletAddress",
            "outletType",
          ],
        },
        {
          model: DeliArea,
          as: "pickupDeliCarArea",
          attributes: [],
        },
        {
          model: DeliArea,
          as: "senderDeliCarArea",
          attributes: [],
        },
        {
          model: townShip,
          as: "townshipData",
          attributes: [],
        },
      ],
    });

    return res.status(201).json({
      message: "Way created successfully",
      data: newWayWithAssociations,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to create way",
    });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const item = await way.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Way not found" });

    const editWay = await item.update(req.body);
    const editWayWithAssociations = await Way.findByPk(editWay.wayId, {
      attributes: [
        "wayId",
        "outletId",
        "customerId",
        "itemPrice",
        "deliFee",
        "status",
        "itemQty",
        "wayType",
        "marketName",
        "pickupDeliCar",
        "senderDeliCar",
        "city",
        "remark",
        "complaint",
        "townShipId",
        "wayDate",
        [Sequelize.col("pickupDeliCarArea.deliCarNo"), "pickupDeliCarNo"],
        [Sequelize.col("senderDeliCarArea.deliCarNo"), "senderDeliCarNo"],
        [Sequelize.col("townshipData.townshipName"), "townshipName"],
      ],
      include: [
        {
          model: customer,
          attributes: ["customerName", "customerPhone", "customerAddress"],
        },
        {
          model: outlet,
          attributes: [
            "outletName",
            "outletPhone",
            "outletAddress",
            "outletType",
          ],
        },
        {
          model: DeliArea,
          as: "pickupDeliCarArea",
          attributes: [],
        },
        {
          model: DeliArea,
          as: "senderDeliCarArea",
          attributes: [],
        },
        {
          model: townShip,
          as: "townshipData",
          attributes: [],
        },
      ],
    });
    return res.status(201).json({
      message: "Way update successfully",
      data: editWayWithAssociations,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to update way entry",
    });
  }
});

// Update Today All Status is delivery
router.patch("/update-all-status-today", verifyToken, async (req, res) => {
  try {
    const { wayIds } = req.body;

    if (!wayIds || !Array.isArray(wayIds) || wayIds.length === 0) {
      return res.status(400).json({ error: "No wayIds provided" });
    }

    const d = new Date();
    const formattedDate = d.toLocaleString('sv-SE', { timeZone: 'Asia/Yangon' }).replace('T', ' ');

    const [affectedRows] = await way.update(
      { status: 5 , updatedDate: formattedDate},      
      {
        where: {
          wayId: {
            [Op.in]: wayIds,            
          },
          status: {
            [Op.ne]: 5 
          }
        },
      },
    );

    res.status(200).json({
      message: "Today's status updated to Deliveried successfully",
      affectedRows,
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Update Status Only
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const item = await way.findByPk(req.params.id);

    if (!item) return res.status(404).json({ error: "Way not found" });
    const updated = await item.update(req.body); // only updates fields in req.body

    // Fetch updated item with associations
    const editWayWithAssociations = await way.findByPk(updated.wayId, {
      attributes: [
        "wayId",
        "outletId",
        "customerId",
        "status",
        "remark",
        "wayDate",
        "wayType",
        "marketName",
        "pickupDeliCar",
        "senderDeliCar",
        "city",
        "complaint",
        [Sequelize.col("pickupDeliCarArea.deliCarNo"), "pickupDeliCarNo"],
        [Sequelize.col("senderDeliCarArea.deliCarNo"), "senderDeliCarNo"],
      ],
      include: [
        {
          model: customer,
          attributes: ["customerName", "customerPhone", "customerAddress"],
        },
        {
          model: outlet,
          attributes: [
            "outletName",
            "outletPhone",
            "outletAddress",
            "outletType",
          ],
        },
        { model: DeliArea, as: "pickupDeliCarArea", attributes: [] },
        { model: DeliArea, as: "senderDeliCarArea", attributes: [] },
      ],
    });

    return res.status(201).json({
      message: "Way updated successfully",
      data: editWayWithAssociations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update way entry" });
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await way.destroy({ where: { wayId: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Way not found" });

    return res.status(201).json({
      message: "Way entry deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete way entry" });
  }
});

// Way Count
router.get("/count-all", verifyToken, async (req, res) => {
  try {
    const statuses = [
      { label: "Pickup", value: 1 },
      { label: "Date Changed", value: 2 },
      { label: "Pending", value: 3 },
      { label: "Return", value: 4 },
      { label: "Delivered", value: 5 },
    ];

    const counts = {};

    for (const status of statuses) {
      const count = await Way.count({ where: { status: status.value } });
      counts[status.label] = count;
    }

    return res.status(200).json({
      message: "successful",
      timestamp: new Date(), // ✅ current date/time
      ...counts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch counts" });
  }
});

export default router;
