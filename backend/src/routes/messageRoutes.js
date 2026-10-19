import express from "express";

import {
  createMessage,
  getMessages,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Send a new message
router.post("/", createMessage);

// Get all messages
router.get("/", getMessages);

// Get one message
router.get("/:id", getMessageById);

// Mark message as read
router.patch("/:id/read", markMessageAsRead);

// Delete message
router.delete("/:id", deleteMessage);

export default router;