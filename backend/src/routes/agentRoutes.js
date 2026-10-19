import express from "express";

import {
  getPublicAgents,
  getPublicAgentById,
  getPrivateAgentProfile,
} from "../controllers/agentController.js";

import { protectAgent } from "../auth/authMiddleware.js";
import { protectProfileUnlock } from "../auth/profileUnlockMiddleware.js";

const router = express.Router();

router.get("/", getPublicAgents);

router.get(
  "/:id/private",
  protectAgent,
  protectProfileUnlock,
  getPrivateAgentProfile,
);

router.get("/:id", getPublicAgentById);

export default router;
