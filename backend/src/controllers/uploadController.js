import multer from "multer";
import path from "path";
import fs from "fs";

// ======================================================
// UPLOAD FOLDER
// ======================================================

const uploadFolder = path.join(process.cwd(), "uploads");

// Create folder if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}

// ======================================================
// STORAGE CONFIGURATION
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, uniqueName);
  },
});

// ======================================================
// FILE VALIDATION
// ======================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
      ),
      false
    );
  }
};

// ======================================================
// MULTER
// ======================================================

export const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 12,
  },
});

// ======================================================
// UPLOAD MULTIPLE IMAGES
// ======================================================

export const uploadImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images were uploaded.",
      });
    }

    const images = req.files.map((file) => ({
      image: `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    res.status(201).json({
      success: true,
      message: `${images.length} image${
        images.length === 1 ? "" : "s"
      } uploaded successfully.`,

      images,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload images.",
    });
  }
};