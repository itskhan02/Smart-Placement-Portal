const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (file.fieldname === "logo") {
      uploadPath = "uploads/company/";
    } else if (file.fieldname === "resume") {
      uploadPath = "uploads/resumes/";
    } else if (file.fieldname === "image" || req.path.includes("/jobs")) {
      uploadPath = "uploads/jobs/";
    } else if (file.fieldname === "file" || req.path.includes("/profile")) {
      uploadPath = "uploads/profiles/";
    }

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images, PDFs, and documents
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images, PDFs, and documents are allowed.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

module.exports = { upload, handleMulterError };