import jwt from "jsonwebtoken";

export const protectProfileUnlock = (req, res, next) => {
  try {
    const token = req.headers["x-profile-unlock"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Profile unlock required.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.type !== "profile_unlock") {
      return res.status(403).json({
        success: false,
        message: "Invalid profile unlock token.",
      });
    }

    req.profileUnlock = decoded;

    next();
  } catch (error) {
    console.error("Profile unlock error:", error);

    return res.status(401).json({
      success: false,
      message: "Profile unlock expired. Please verify again.",
    });
  }
};