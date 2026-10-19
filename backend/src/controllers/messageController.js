import { db } from "../db/db.js";
import { messages, properties } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";

// ======================================================
// CREATE MESSAGE
// ======================================================

export const createMessage = async (req, res) => {
  try {
    const {
      propertyId,
      senderName,
      senderEmail,
      senderPhone,
      message,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required.",
      });
    }

    if (!senderName || !senderName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Your name is required.",
      });
    }

    if (!senderEmail?.trim() && !senderPhone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email or phone number.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // ==================================================
    // CHECK PROPERTY
    // ==================================================

    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, Number(propertyId)));

    if (property.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    // ==================================================
    // SAVE MESSAGE
    // ==================================================

    const newMessage = await db
      .insert(messages)
      .values({
        propertyId: Number(propertyId),
        senderName: senderName.trim(),
        senderEmail: senderEmail?.trim() || null,
        senderPhone: senderPhone?.trim() || null,
        message: message.trim(),
      })
      .returning();

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: newMessage[0],
    });
  } catch (error) {
    console.error("Error creating message:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};

// ======================================================
// GET ALL MESSAGES
// ======================================================

export const getMessages = async (req, res) => {
  try {
    const allMessages = await db
      .select({
        id: messages.id,
        propertyId: messages.propertyId,
        senderName: messages.senderName,
        senderEmail: messages.senderEmail,
        senderPhone: messages.senderPhone,
        message: messages.message,
        isRead: messages.isRead,
        createdAt: messages.createdAt,

        propertyTitle: properties.title,
        propertyLocation: properties.location,
      })
      .from(messages)
      .leftJoin(
        properties,
        eq(messages.propertyId, properties.id)
      )
      .orderBy(desc(messages.createdAt));

    res.json({
      success: true,
      messages: allMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

// ======================================================
// GET ONE MESSAGE
// ======================================================

export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        id: messages.id,
        propertyId: messages.propertyId,
        senderName: messages.senderName,
        senderEmail: messages.senderEmail,
        senderPhone: messages.senderPhone,
        message: messages.message,
        isRead: messages.isRead,
        createdAt: messages.createdAt,

        propertyTitle: properties.title,
        propertyLocation: properties.location,
      })
      .from(messages)
      .leftJoin(
        properties,
        eq(messages.propertyId, properties.id)
      )
      .where(eq(messages.id, Number(id)));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    res.json({
      success: true,
      message: result[0],
    });
  } catch (error) {
    console.error("Error fetching message:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch message.",
    });
  }
};

// ======================================================
// MARK MESSAGE AS READ
// ======================================================

export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMessage = await db
      .update(messages)
      .set({
        isRead: true,
      })
      .where(eq(messages.id, Number(id)))
      .returning();

    if (updatedMessage.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    res.json({
      success: true,
      message: "Message marked as read.",
      data: updatedMessage[0],
    });
  } catch (error) {
    console.error(
      "Error marking message as read:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update message.",
    });
  }
};

// ======================================================
// DELETE MESSAGE
// ======================================================

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMessage = await db
      .delete(messages)
      .where(eq(messages.id, Number(id)))
      .returning();

    if (deletedMessage.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully.",
      data: deletedMessage[0],
    });
  } catch (error) {
    console.error("Error deleting message:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete message.",
    });
  }
};