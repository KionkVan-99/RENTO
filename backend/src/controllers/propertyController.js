import { db } from "../db/db.js";
import { agents, properties } from "../db/schema.js";
import { eq, and, desc, count } from "drizzle-orm";

// ======================================================
// RENTO PLAN LIMITS
// ======================================================

const PLAN_LIMITS = {
  free: 5,
  pro: 30,
  business: 100,
};

const DEFAULT_PLAN = "free";

// ======================================================
// GET ALL PUBLIC PROPERTIES
// ======================================================

export const getProperties = async (req, res) => {
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
        amenities: properties.amenities,
        documents: properties.documents,
        images: properties.images,

        ownerName: properties.ownerName,
        ownerPhone: properties.ownerPhone,
        ownerEmail: properties.ownerEmail,

        status: properties.status,
        soldAt: properties.soldAt,
        rentedAt: properties.rentedAt,

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
    console.error("Error fetching properties:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

// ======================================================
// GET ONE PUBLIC PROPERTY
// ======================================================

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await db
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
        documents: properties.documents,
        images: properties.images,

        ownerName: properties.ownerName,
        ownerPhone: properties.ownerPhone,
        ownerEmail: properties.ownerEmail,

        status: properties.status,
        soldAt: properties.soldAt,
        rentedAt: properties.rentedAt,

        agentId: properties.agentId,
        createdAt: properties.createdAt,
      })
      .from(properties)
      .where(eq(properties.id, Number(id)));

    if (property.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.json({
      success: true,
      property: property[0],
    });
  } catch (error) {
    console.error("Error fetching property:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};

// ======================================================
// GET MY PROPERTIES
// ======================================================

export const getMyProperties = async (req, res) => {
  try {
    if (!req.agent || !req.agent.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in as an agent.",
      });
    }

    const agentId = Number(req.agent.id);

    const myProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.agentId, agentId))
      .orderBy(desc(properties.createdAt));

    return res.json({
      success: true,
      properties: myProperties,
    });
  } catch (error) {
    console.error("Error fetching agent properties:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your properties",
    });
  }
};

// ======================================================
// CREATE PROPERTY
// ======================================================

export const createProperty = async (req, res) => {
  try {
    if (!req.agent || !req.agent.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in as an agent.",
      });
    }

    const agentId = Number(req.agent.id);

    // --------------------------------------------------
    // GET AGENT PLAN
    // --------------------------------------------------

    const agentResult = await db
      .select({
        id: agents.id,
        plan: agents.plan,
      })
      .from(agents)
      .where(eq(agents.id, agentId));

    if (agentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Agent account not found.",
      });
    }

    const agent = agentResult[0];

    const currentPlan = String(agent.plan || DEFAULT_PLAN).toLowerCase();

    const planLimit = PLAN_LIMITS[currentPlan] || PLAN_LIMITS[DEFAULT_PLAN];

    // --------------------------------------------------
    // CHECK ACTIVE PROPERTY LIMIT
    // --------------------------------------------------

    const activePropertyCount = await db
      .select({
        count: count(),
      })
      .from(properties)
      .where(
        and(eq(properties.agentId, agentId), eq(properties.status, "active")),
      );

    const currentActiveProperties = Number(activePropertyCount[0]?.count || 0);

    if (currentActiveProperties >= planLimit) {
      const planName =
        currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

      return res.status(403).json({
        success: false,
        code: "PLAN_LIMIT_REACHED",
        message: `You have reached the ${planName} plan limit of ${planLimit} active properties.`,
        plan: currentPlan,
        limit: planLimit,
        activeProperties: currentActiveProperties,
        upgradeRequired: currentPlan !== "business",
      });
    }

    const body = req.body || {};

    const {
      title,
      description,
      type,
      listingType,
      price,
      location,
      city,
      state,
      bedrooms,
      bathrooms,
      parkingSpaces,
      area,
      landUnit,
      landPurpose,
      negotiable,
      amenities,
      documents,
      images,
      ownerName,
      ownerPhone,
      ownerEmail,
      featured,
    } = body;

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Property title is required.",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Property type is required.",
      });
    }

    if (!listingType) {
      return res.status(400).json({
        success: false,
        message: "Listing type is required.",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid property price is required.",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Property location is required.",
      });
    }

    // --------------------------------------------------
    // PREPARE ARRAYS
    // --------------------------------------------------

    const safeAmenities = Array.isArray(amenities) ? amenities : [];

    const safeDocuments = Array.isArray(documents) ? documents : [];

    const safeImages = Array.isArray(images) ? images : [];

    // --------------------------------------------------
    // CREATE PROPERTY
    // --------------------------------------------------

    const newProperty = await db
      .insert(properties)
      .values({
        title: title.trim(),

        description: description?.trim() || null,

        type,

        listingType,

        price: Number(price),

        location: location.trim(),

        city: city?.trim() || null,

        state: state?.trim() || null,

        bedrooms:
          bedrooms !== undefined && bedrooms !== null ? Number(bedrooms) : 0,

        bathrooms:
          bathrooms !== undefined && bathrooms !== null ? Number(bathrooms) : 0,

        parkingSpaces:
          parkingSpaces !== undefined && parkingSpaces !== null
            ? Number(parkingSpaces)
            : 0,

        area: area !== undefined && area !== null ? Number(area) : 0,

        landUnit: landUnit || null,

        landPurpose: landPurpose || null,

        negotiable: Boolean(negotiable),

        amenities: safeAmenities,

        documents: safeDocuments,

        images: safeImages,

        ownerName: ownerName?.trim() || null,

        ownerPhone: ownerPhone?.trim() || null,

        ownerEmail: ownerEmail?.trim() || null,

        featured: Boolean(featured),

        status: "active",

        soldAt: null,

        rentedAt: null,

        tenantName: null,

        tenantPhone: null,

        tenantEmail: null,

        monthlyRent: null,

        moveInDate: null,

        leaseDuration: null,

        agentId,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: newProperty[0],
    });
  } catch (error) {
    console.error("Error creating property:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create property",
    });
  }
};

// ======================================================
// UPDATE PROPERTY
// ======================================================

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.agent || !req.agent.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in as an agent.",
      });
    }

    const body = req.body || {};

    const {
      title,
      description,
      type,
      listingType,
      price,
      location,
      city,
      state,
      bedrooms,
      bathrooms,
      parkingSpaces,
      area,
      landUnit,
      landPurpose,
      negotiable,
      amenities,
      documents,
      images,
      ownerName,
      ownerPhone,
      ownerEmail,
      featured,
    } = body;

    const safeAmenities = Array.isArray(amenities) ? amenities : [];

    const safeDocuments = Array.isArray(documents) ? documents : [];

    const safeImages = Array.isArray(images) ? images : [];

    const updatedProperty = await db
      .update(properties)
      .set({
        title: title?.trim(),

        description: description?.trim() || null,

        type,

        listingType,

        price: Number(price),

        location: location?.trim(),

        city: city?.trim() || null,

        state: state?.trim() || null,

        bedrooms:
          bedrooms !== undefined && bedrooms !== null ? Number(bedrooms) : 0,

        bathrooms:
          bathrooms !== undefined && bathrooms !== null ? Number(bathrooms) : 0,

        parkingSpaces:
          parkingSpaces !== undefined && parkingSpaces !== null
            ? Number(parkingSpaces)
            : 0,

        area: area !== undefined && area !== null ? Number(area) : 0,

        landUnit: landUnit || null,

        landPurpose: landPurpose || null,

        negotiable: Boolean(negotiable),

        amenities: safeAmenities,

        documents: safeDocuments,

        images: safeImages,

        ownerName: ownerName?.trim() || null,

        ownerPhone: ownerPhone?.trim() || null,

        ownerEmail: ownerEmail?.trim() || null,

        featured: Boolean(featured),
      })
      .where(
        and(
          eq(properties.id, Number(id)),
          eq(properties.agentId, Number(req.agent.id)),
        ),
      )
      .returning();

    if (updatedProperty.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found or you do not have permission to edit it.",
      });
    }

    return res.json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty[0],
    });
  } catch (error) {
    console.error("Error updating property:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update property",
    });
  }
};

// ======================================================
// MARK PROPERTY AS SOLD
// ======================================================

export const markPropertyAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.agent || !req.agent.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in as an agent.",
      });
    }

    const updatedProperty = await db
      .update(properties)
      .set({
        status: "sold",
        soldAt: new Date(),
      })
      .where(
        and(
          eq(properties.id, Number(id)),
          eq(properties.agentId, Number(req.agent.id)),
        ),
      )
      .returning();

    if (updatedProperty.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found or you do not have permission to update it.",
      });
    }

    return res.json({
      success: true,
      message: "Property marked as sold.",
      property: updatedProperty[0],
    });
  } catch (error) {
    console.error("Error marking property as sold:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark property as sold.",
    });
  }
};

// ======================================================
// MARK PROPERTY AS RENTED
// ======================================================

export const markPropertyAsRented = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.agent || !req.agent.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in as an agent.",
      });
    }

    const body = req.body || {};

    const {
      tenantName,
      tenantPhone,
      tenantEmail,
      monthlyRent,
      moveInDate,
      leaseDuration,
    } = body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!tenantName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tenant name is required.",
      });
    }

    if (!tenantPhone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tenant phone number is required.",
      });
    }

    if (
      monthlyRent === undefined ||
      monthlyRent === null ||
      Number(monthlyRent) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid monthly rent is required.",
      });
    }

    if (!moveInDate) {
      return res.status(400).json({
        success: false,
        message: "Move-in date is required.",
      });
    }

    if (!leaseDuration?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Lease duration is required.",
      });
    }

    const parsedMoveInDate = new Date(moveInDate);

    if (Number.isNaN(parsedMoveInDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid move-in date.",
      });
    }

    // --------------------------------------------------
    // UPDATE PROPERTY
    // --------------------------------------------------

    const updatedProperty = await db
      .update(properties)
      .set({
        status: "rented",

        rentedAt: new Date(),

        tenantName: tenantName.trim(),

        tenantPhone: tenantPhone.trim(),

        tenantEmail: tenantEmail?.trim() || null,

        monthlyRent: Number(monthlyRent),

        moveInDate: parsedMoveInDate,

        leaseDuration: leaseDuration.trim(),
      })
      .where(
        and(
          eq(properties.id, Number(id)),
          eq(properties.agentId, Number(req.agent.id)),
        ),
      )
      .returning();

    if (updatedProperty.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found or you do not have permission to manage this property.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property marked as rented successfully.",
      property: updatedProperty[0],
    });
  } catch (error) {
    console.error("Error marking property as rented:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark property as rented.",
    });
  }
};

// ======================================================
// RESTORE PROPERTY
// ======================================================

export const restoreProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.agent || !req.agent.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in as an agent.",
      });
    }

    const updatedProperty = await db
      .update(properties)
      .set({
        status: "active",

        soldAt: null,

        rentedAt: null,

        tenantName: null,

        tenantPhone: null,

        tenantEmail: null,

        monthlyRent: null,

        moveInDate: null,

        leaseDuration: null,
      })
      .where(
        and(
          eq(properties.id, Number(id)),
          eq(properties.agentId, Number(req.agent.id)),
        ),
      )
      .returning();

    if (updatedProperty.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found or you do not have permission to restore it.",
      });
    }

    return res.json({
      success: true,
      message: "Property restored successfully.",
      property: updatedProperty[0],
    });
  } catch (error) {
    console.error("Error restoring property:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to restore property.",
    });
  }
};

// ======================================================
// DELETE PROPERTY
// ======================================================

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.agent || !req.agent.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in as an agent.",
      });
    }

    const deletedProperty = await db
      .delete(properties)
      .where(
        and(
          eq(properties.id, Number(id)),
          eq(properties.agentId, Number(req.agent.id)),
        ),
      )
      .returning();

    if (deletedProperty.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found or you do not have permission to delete it.",
      });
    }

    return res.json({
      success: true,
      message: "Property deleted successfully.",
      property: deletedProperty[0],
    });
  } catch (error) {
    console.error("Error deleting property:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete property.",
    });
  }
};
