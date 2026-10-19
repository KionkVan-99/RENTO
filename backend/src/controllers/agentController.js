import { eq, desc } from "drizzle-orm";

import { db } from "../db/db.js";
import { agents, properties } from "../db/schema.js";

/*
|--------------------------------------------------------------------------
| GET ALL PUBLIC AGENTS
|--------------------------------------------------------------------------
*/

export const getPublicAgents = async (req, res) => {
  try {
    const publicAgents = await db
      .select({
        id: agents.id,
        fullName: agents.fullName,
        agencyName: agents.agencyName,
        profileImage: agents.profileImage,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .where(eq(agents.role, "agent"))
      .orderBy(desc(agents.createdAt));

    return res.json({
      success: true,
      agents: publicAgents,
    });
  } catch (error) {
    console.error("Get public agents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load agents.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PUBLIC AGENT PROFILE
|--------------------------------------------------------------------------
*/

export const getPublicAgentById = async (req, res) => {
  try {
    const agentId = Number(req.params.id);

    if (!Number.isInteger(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    const result = await db
      .select({
        id: agents.id,
        fullName: agents.fullName,
        agencyName: agents.agencyName,
        profileImage: agents.profileImage,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .where(eq(agents.id, agentId));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    const agent = result[0];

    // Only show properties belonging to this agent.
    const agentProperties = await db
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
        amenities: properties.amenities,
        images: properties.images,
        createdAt: properties.createdAt,
      })
      .from(properties)
      .where(eq(properties.agentId, agentId))
      .orderBy(desc(properties.createdAt));

    return res.json({
      success: true,
      agent,
      properties: agentProperties,
    });
  } catch (error) {
    console.error("Get public agent profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load agent profile.",
    });
  }
};
// GET PRIVATE AGENT PROFILE
export const getPrivateAgentProfile = async (req, res) => {
  try {
    const agentId = Number(req.params.id);
    const unlockedAgentId = Number(req.profileUnlock?.id);

    if (!Number.isInteger(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    // The unlocked account must match the profile being requested.
    if (agentId !== unlockedAgentId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this profile.",
      });
    }

    const result = await db
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
      .where(eq(agents.id, agentId));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    const agent = result[0];

    const agentProperties = await db
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
        amenities: properties.amenities,
        images: properties.images,
        createdAt: properties.createdAt,
      })
      .from(properties)
      .where(eq(properties.agentId, agentId))
      .orderBy(desc(properties.createdAt));

    return res.json({
      success: true,
      agent,
      properties: agentProperties,
    });
  } catch (error) {
    console.error("Get private agent profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load private profile.",
    });
  }
};
