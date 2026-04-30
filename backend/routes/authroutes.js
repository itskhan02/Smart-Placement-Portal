const router = require("express").Router();
const authControllers = require("../controllers/authControllers");
const { isAuthenticate, authorizeRoles } = require("../middleware/isAuthenticated");

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);

router.get("/profile", isAuthenticate, (req, res) => {
  res.json({ user: req.user });
});

router.get("/recruiter", isAuthenticate, authorizeRoles("recruiter"), (req, res) => {
  res.json({ message: "Recruiter Access" });
});

router.get("/student", isAuthenticate, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Student Access" });
});

router.get("/admin", isAuthenticate, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin Access" });
});

router.post("/forgot-password", authControllers.forgotPassword);
router.post("/reset-password", authControllers.resetPassword);

router.post("/logout-all", isAuthenticate, authControllers.logoutAll);

module.exports = router;