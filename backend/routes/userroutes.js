const router = require("express").Router();
const userControllers = require("../controllers/userControllers");
const { isAuthenticate } = require("../middleware/isAuthenticated");
const { upload, handleMulterError } = require("../middleware/upload");

// Get current user profile
router.get("/profile", isAuthenticate, userControllers.getProfile);

// Update user profile
router.put("/profile/update", isAuthenticate, userControllers.updateProfile);

// Update profile picture
router.put(
  "/profile/picture",
  isAuthenticate,
  upload.single("file"),
  handleMulterError,
  userControllers.updateProfilePicture
);

router.put("/profile/skills", isAuthenticate, userControllers.addSkills);
router.post("/profile/education", isAuthenticate, userControllers.addEducation);
router.delete("/profile/education/:index", isAuthenticate, userControllers.deleteEducation);
router.post("/profile/experience", isAuthenticate, userControllers.addExperience);
router.delete("/profile/experience/:index", isAuthenticate, userControllers.deleteExperience);
router.post("/profile/resume", isAuthenticate, upload.single("resume"), handleMulterError, userControllers.uploadResume);
router.post("/email/send-otp", isAuthenticate, userControllers.sendEmailUpdateOtp);
router.post("/email/verify-otp", isAuthenticate, userControllers.verifyEmailUpdateOtp);
router.put("/deactivate", isAuthenticate, userControllers.deactivateUser);
router.delete("/delete", isAuthenticate, userControllers.deleteUser);
router.get("/:id", isAuthenticate, userControllers.getUserById);

// router.get("/recruiters/all", isAuthenticate, userControllers.getRecruiters);

// router.get("/students/all", isAuthenticate, userControllers.getStudents);

module.exports = router;