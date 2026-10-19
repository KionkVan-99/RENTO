import express from "express";

import {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  markPropertyAsSold,
  markPropertyAsRented,
  restoreProperty,
  deleteProperty,
} from "../controllers/propertyController.js";

import { protectAgent } from "../auth/authMiddleware.js";

const router = express.Router();

// ======================================================
// PUBLIC
// ======================================================

router.get("/", getProperties);

// IMPORTANT:
// Specific routes must come before /:id

router.get("/agent/my-properties", protectAgent, getMyProperties);

// ======================================================
// AGENT PROPERTY ACTIONS
// ======================================================

router.patch("/:id/sold", protectAgent, markPropertyAsSold);

router.patch("/:id/rented", protectAgent, markPropertyAsRented);

router.patch("/:id/restore", protectAgent, restoreProperty);

router.put("/:id", protectAgent, updateProperty);

router.delete("/:id", protectAgent, deleteProperty);

// ======================================================
// PUBLIC SINGLE PROPERTY
// ======================================================

router.get("/:id", getPropertyById);

// ======================================================
// CREATE
// ======================================================

router.post("/", protectAgent, createProperty);
export default router;