import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db/db.js";
import { agents } from "../db/schema.js";

// ======================================================
// REGISTER AGENT
// ======================================================

export const registerAgent = async (req, res) => {
  try {
    const { fullName, email, phone, agencyName, password } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ==================================================
    // CHECK EXISTING EMAIL
    // ==================================================

    const existingAgent = await db
      .select()
      .from(agents)
      .where(eq(agents.email, normalizedEmail));

    if (existingAgent.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ==================================================
    // PROFILE IMAGE
    // ==================================================

    let profileImage = null;

    if (req.file) {
      profileImage = `/uploads/agents/${req.file.filename}`;
    }

    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const hashedPassword = await bcrypt.hash(password, 12);

    // ==================================================
    // CREATE AGENT
    // ==================================================

    const newAgent = await db
      .insert(agents)
      .values({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        agencyName: agencyName?.trim() || null,
        password: hashedPassword,
        profileImage,
      })
      .returning({
        id: agents.id,
        fullName: agents.fullName,
        email: agents.email,
        phone: agents.phone,
        agencyName: agents.agencyName,
        profileImage: agents.profileImage,
        plan: agents.plan,
        role: agents.role,
      });

    const agent = newAgent[0];

    // ==================================================
    // CREATE JWT
    // ==================================================

    const token = jwt.sign(
      {
        id: agent.id,
        email: agent.email,
        role: agent.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,
      message: "Agent account created successfully.",
      token,
      agent,
    });
  } catch (error) {
    console.error("Agent registration error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create agent account.",
    });
  }
};

// ======================================================
// LOGIN AGENT
// ======================================================

export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ==================================================
    // FIND AGENT
    // ==================================================

    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.email, normalizedEmail));

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const agent = result[0];

    // ==================================================
    // CHECK PASSWORD
    // ==================================================

    const passwordMatches = await bcrypt.compare(
      password,
      agent.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ==================================================
    // CREATE JWT
    // ==================================================

    const token = jwt.sign(
      {
        id: agent.id,
        email: agent.email,
        role: agent.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({
      success: true,
      message: "Login successful.",
      token,

      agent: {
        id: agent.id,
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.phone,
        agencyName: agent.agencyName,
        profileImage: agent.profileImage,
        plan: agent.plan,
        role: agent.role,
      },
    });
  } catch (error) {
    console.error("Agent login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login.",
    });
  }
};

// ======================================================
// VERIFY AGENT PROFILE ACCESS
// ======================================================

export const verifyProfileAccess = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const agentId = Number(req.agent.id);

    if (!agentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Agent account not found.",
      });
    }

    const agent = result[0];

    const passwordMatches = await bcrypt.compare(
      password,
      agent.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // ==================================================
    // CREATE PROFILE UNLOCK TOKEN
    // ==================================================

    const unlockToken = jwt.sign(
      {
        id: agent.id,
        type: "profile_unlock",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );

    return res.json({
      success: true,
      message: "Profile access verified.",
      unlockToken,
    });
  } catch (error) {
    console.error("Profile verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify profile access.",
    });
  }
};