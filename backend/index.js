import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import os from "os";

import customerRoutes from "./routes/customerRoutes.js";
import deliAreaRoutes from "./routes/deliAreaRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import outletRoutes from "./routes/outletRoutes.js";
import wayRoutes from "./routes/wayRoutes.js";
import ocLinkRoutes from "./routes/ocLinkRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import townShipRoutes from "./routes/townShipRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base route
app.get("/", (req, res) => res.send("API is running..."));

// Get local IP
const networkInterfaces = os.networkInterfaces();
const localIP =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal)?.address ||
  "localhost";

// API routes
app.use("/api/customers", customerRoutes);
app.use("/api/deliarea", deliAreaRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/way", wayRoutes);
app.use("/api/outlet", outletRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/ocLink", ocLinkRoutes);
app.use("/api/townShip", townShipRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use('/api/route', routeRoutes);

// Sync DB and start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync(); // optional: { alter: true }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://${localIP}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();
