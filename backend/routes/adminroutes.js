const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticate, authorizeRoles } = require("../middleware/isAuthenticated");


router.use(isAuthenticate, authorizeRoles("admin"));

router.get("/dashboard",  adminController.getDashboardStats);

router.get("/users", isAuthenticate, authorizeRoles("admin"), adminController.getAllUsers);

router.delete("/users/:id", isAuthenticate, authorizeRoles("admin"), adminController.deleteUser);

router.get("/jobs", isAuthenticate, authorizeRoles("admin"),  adminController.getAllJobs);

router.delete("/jobs/:id", isAuthenticate, authorizeRoles("admin"), adminController.deleteJob);

router.get("/applications", isAuthenticate, authorizeRoles("admin"), adminController.getAllApplications);

router.get("/recent-activity", isAuthenticate, authorizeRoles("admin"), adminController.getRecentActivity);

router.put("/users/:id/toggle", isAuthenticate, authorizeRoles("admin"), adminController.toggleUserStatus);

router.get("/reports", isAuthenticate, authorizeRoles("admin"), adminController.getReports);

router.post("/reports/:id/action", isAuthenticate, authorizeRoles("admin"), adminController.takeAction );

router.post("/warn", isAuthenticate, authorizeRoles("admin"), adminController.sendWarning);

module.exports = router;