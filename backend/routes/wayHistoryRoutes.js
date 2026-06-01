import express from "express";
import WayHistory from "../models/wayHistory.js";
import { Op } from "sequelize";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", verifyToken, async (req, res) => {
  try {
    const { wayId, historyData } = req.body;

    const newHistory = await WayHistory.create({
      wayId: wayId,
      historyData: historyData,
    });

    return res.status(201).json({
      message: "WayHistory created successfully",
      data: newHistory,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to create WayHistory",
      details: error.errors
        ? error.errors.map((e) => e.message)
        : "No specific details",
    });
  }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const wayHistory = await WayHistory.findOne({
      where: { wayId: req.params.id },
    });

    if (!wayHistory) {
      return res
        .status(404)
        .json({ error: "WayHistory for this wayId not found" });
    }

    // 🎯 Frontend က ပို့လိုက်တဲ့ Array အပြည့်အစုံကြီးကို ယူမယ်
    const updatedData = req.body;

    // စိတ်ချရအောင် Array ဟုတ်မဟုတ် စစ်မယ် (Array မဟုတ်ရင် အဟောင်းအတိုင်း ထားမယ်)
    if (!Array.isArray(updatedData)) {
      return res
        .status(400)
        .json({ error: "Invalid data format. Expected an Array." });
    }

    // 🚀 DB ထဲကို Frontend က ပို့လိုက်တဲ့ Array အသစ်အတိုင်း တိုက်ရိုက် Overwrite (အစားထိုး) သိမ်းလိုက်ပါပြီ
    await wayHistory.update({ historyData: updatedData });

    return res.status(200).json({
      message: "WayHistory updated successfully",
      data: wayHistory,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      error: "Failed to update WayHistory",
      details: error.message,
    });
  }
});

router.patch("/", verifyToken, async (req, res) => {
  try {
    const { wayIds, currentTimestamp } = req.body;

  
    if (!wayIds || !Array.isArray(wayIds) || wayIds.length === 0) {
      return res.status(400).json({ error: "No wayIds provided" });
    }

    const cleanWayIds = wayIds.map((id) => Number(id));    
    
    const existingHistories = await WayHistory.findAll({
      where: {
        wayId: {
          [Op.in]: cleanWayIds, 
        },
      },
    });

    const newHistoryEntry = {
      status: 5,
      complaint: "",
      changed_at: currentTimestamp,
    };    
    
    const updatePromises = existingHistories.map(async (historyRecord) => {
      let currentDataList = historyRecord.historyData || [];
      
      if (typeof currentDataList === "string") {
        try {
          currentDataList = JSON.parse(currentDataList);
        } catch (e) {
          currentDataList = []; 
        }
      }
      
      if (!Array.isArray(currentDataList)) {
        currentDataList = currentDataList ? [currentDataList] : [];
      }
      
      const updatedHistoryArray = [...currentDataList, newHistoryEntry];
      
      return historyRecord.update({
        historyData: updatedHistoryArray,
      });
    });
    

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: "All WayHistories updated successfully",
    });
  } catch (error) {
    console.error("Bulk History Update Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to update bulk history", details: error.message });
  }
});

//Read
// Get WayHistory by wayId
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const wayHistory = await WayHistory.findOne({
      where: { wayId: Number(req.params.id) },
    });

    if (!wayHistory) {
      return res.status(404).json({ message: "မှတ်တမ်း ရှာမတွေ့ပါ" });
    }

    // 🎯 Database ထဲက historyData (JSON) ကို ယူမယ်
    let dataList = wayHistory.historyData || [];

    // တကယ်လို့ string ဖြစ်နေရင် frontend သုံးရလွယ်အောင် array/object အဖြစ် parse လုပ်ပေးလိုက်မယ်
    if (typeof dataList === "string") {
      dataList = JSON.parse(dataList);
    }

    return res.status(200).json({
      success: true,
      data: dataList, // 🚀 [ {status: 1, ...} ] ဆိုတဲ့ Array အတိုင်း ထွက်သွားမယ်
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const wayHistory = await WayHistory.findOne({
      where: { wayId: id },
    });

    if (!wayHistory) {
      return res.status(404).json({ error: "WayHistory not found" });
    }

    await wayHistory.destroy();
    return res.status(200).json({ message: "WayHistory deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ error: "Failed to delete WayHistory" });
  }
});

export default router;
