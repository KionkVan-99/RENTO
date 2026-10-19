import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import agentRoutes from "./routes/agentRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import adminRoutes from "./admin/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// STATIC FILES
// ======================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// ======================================================
// API STATUS
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RENTO API is running 🚀",
  });
});

// ======================================================
// ROUTES
// ======================================================

app.use("/api/properties", propertyRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/agents", agentRoutes);

// PAYMENT ROUTES
app.use("/api/payments", paymentRoutes);

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(
    `🚀 RENTO server running on http://localhost:${PORT}`
  );
});