import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { agents, properties, messages } from "../db/schema.js";

// ======================================================
// ADMIN OVERVIEW
// ======================================================

export const getAdminOverview = async (req, res) => {
  try {
    const allAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.role, "agent"));

    const allProperties = await db.select().from(properties);

    const allMessages = await db.select().from(messages);

    return res.json({
      success: true,
      message: "Welcome to the RENTO admin area.",
      admin: req.agent,

      stats: {
        agents: allAgents.length,
        properties: allProperties.length,
        messages: allMessages.length,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin overview.",
    });
  }
};

// ======================================================
// GET ALL PROPERTIES
// ======================================================

export const getAdminProperties = async (req, res) => {
  try {
    const allProperties = await db
      .select({
        id: properties.id,
        title: properties.title,
        description: properties.description,
        type: properties.type,
        listingType: properties.listingType,
        price: properties.price,
        location: properties.location,
        city: properties.city,
        state: properties.state,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        parkingSpaces: properties.parkingSpaces,
        area: properties.area,
        landUnit: properties.landUnit,
        landPurpose: properties.landPurpose,
        negotiable: properties.negotiable,
        featured: properties.featured,
        images: properties.images,
        ownerName: properties.ownerName,
        ownerPhone: properties.ownerPhone,
        ownerEmail: properties.ownerEmail,
        agentId: properties.agentId,
        createdAt: properties.createdAt,
      })
      .from(properties)
      .orderBy(desc(properties.createdAt));

    return res.json({
      success: true,
      properties: allProperties,
    });
  } catch (error) {
    console.error("Admin properties error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load properties.",
    });
  }
};

// ======================================================
// DELETE ANY PROPERTY
// ======================================================

export const deleteAdminProperty = async (req, res) => {
  try {
    const propertyId = Number(req.params.id);

    if (!Number.isInteger(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    const existingProperty = await db
      .select({
        id: properties.id,
        title: properties.title,
      })
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (existingProperty.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    await db.delete(properties).where(eq(properties.id, propertyId));

    return res.json({
      success: true,
      message: `Property "${existingProperty[0].title}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Admin delete property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete property.",
    });
  }
};
// ======================================================
// GET ALL REGISTERED AGENTS
// ======================================================

export const getAdminAgents = async (req, res) => {
  try {
    const allAgents = await db
      .select({
        id: agents.id,
        fullName: agents.fullName,
        email: agents.email,
        phone: agents.phone,
        agencyName: agents.agencyName,
        profileImage: agents.profileImage,
        role: agents.role,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .where(eq(agents.role, "agent"))
      .orderBy(desc(agents.createdAt));

    return res.json({
      success: true,
      agents: allAgents,
    });
  } catch (error) {
    console.error("Admin agents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load registered agents.",
    });
  }
};
