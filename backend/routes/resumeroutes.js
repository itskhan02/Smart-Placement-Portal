const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const {
  isAuthenticate,
  authorizeRoles,
} = require("../middleware/isAuthenticated");
const { upload, handleMulterError } = require("../middleware/upload");

// Analyze resume
router.post(
  "/analyze",
  isAuthenticate,
  authorizeRoles("student"),
  upload.single("resume"),
  handleMulterError,
  resumeController.analyzeResume,
);

// Get analysis history
router.get(
  "/history",
  isAuthenticate,
  authorizeRoles("student"),
  resumeController.getAnalysisHistory,
);

// Get single analysis by history ID
router.get(
  "/:id",
  isAuthenticate,
  authorizeRoles("student"),
  resumeController.getAnalysisById,
);

// Compare two analyses
router.get(
  "/compare/:id1/:id2",
  isAuthenticate,
  authorizeRoles("student"),
  resumeController.compareAnalyses,
);

// Delete an analysis
router.delete(
  "/:id",
  isAuthenticate,
  authorizeRoles("student"),
  resumeController.deleteAnalysis,
);

module.exports = router;
