import express from "express";

import {
  getAdminOverview,
  getAdminProperties,
  deleteAdminProperty,
  getAdminAgents,
} from "./adminController.js";

import { protectAdmin } from "../auth/adminMiddleware.js";

const router = express.Router();

// ======================================================
// ADMIN OVERVIEW
// ======================================================

router.get("/overview", protectAdmin, getAdminOverview);

// ======================================================
// ADMIN PROPERTIES
// ======================================================

router.get("/properties", protectAdmin, getAdminProperties);

// ======================================================
// DELETE PROPERTY
// ======================================================

router.delete("/properties/:id", protectAdmin, deleteAdminProperty);

// ======================================================
// ADMIN AGENTS
// ======================================================

router.get("/agents", protectAdmin, getAdminAgents);

export default router;
