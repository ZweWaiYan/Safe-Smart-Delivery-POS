import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../backend/models/user.js";
import Route from "../models/route.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { userPhone, userPassword } = req.body;

    if (!userPhone || !userPassword) {
      return res
        .status(400)
        .json({ message: "Phone number and password required" });
    }

    const user = await User.findOne({
      where: { userPhone },
      include: [
        {
          model: Route, // or Permission
          attributes: [
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

    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid credentials: user not found" });

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Invalid credentials: wrong password" });

    const token = jwt.sign(
      { id: user.userId, phone: user.userPhone, position: user.userPosition },
      process.env.JWT_SECRET,
      // { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.userId,
        name: user.userName,
        phone: user.userPhone,
        position: user.userPosition,
        routes: user.Routes || [], // depending on your model name
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/protected", async (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

export default router;
