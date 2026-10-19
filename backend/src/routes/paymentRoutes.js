import express from "express";

import {
  createPayment,
  getMyPayments,
  getMySubscriptions,
  createFeaturedPayment,
  getMyFeaturedListings,
  verifyPayment,
} from "../controllers/paymentController.js";

import { protectAgent } from "../auth/authMiddleware.js";

const router = express.Router();

// SUBSCRIPTIONS
router.post("/", protectAgent, createPayment);
router.get("/my-payments", protectAgent, getMyPayments);
router.get("/my-subscriptions", protectAgent, getMySubscriptions);

// PAYMENT VERIFICATION
router.post("/verify", protectAgent, verifyPayment);

// FEATURED PROPERTIES
router.post("/featured", protectAgent, createFeaturedPayment);
router.get("/my-featured", protectAgent, getMyFeaturedListings);

export default router;
