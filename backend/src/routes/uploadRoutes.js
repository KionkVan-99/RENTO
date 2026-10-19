import express from "express";

import {
  upload,
  uploadImages,
} from "../controllers/uploadController.js";

const router = express.Router();

// Upload multiple property images
router.post(
  "/",
  upload.array("images", 12),
  uploadImages
);

export default router;