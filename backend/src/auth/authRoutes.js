import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  registerAgent,
  loginAgent,
  verifyProfileAccess,
} from "./authController.js";
const router = express.Router();
import { protectAgent } from "./authMiddleware.js";

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(__dirname, "../../uploads/agents");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName = `agent-${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${extension}`;

    cb(null, uniqueName);
  },
});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WEBP images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ======================================================
// ROUTES
// ======================================================

router.post("/register", upload.single("profileImage"), registerAgent);

router.post("/login", loginAgent);

router.post("/verify-profile", protectAgent, verifyProfileAccess);

export default router;
