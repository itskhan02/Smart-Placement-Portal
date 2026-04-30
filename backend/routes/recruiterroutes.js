const router = require("express").Router();
const recruiterController = require("../controllers/recruiterController");
const { isAuthenticate, authorizeRoles } = require("../middleware/isAuthenticated");

router.get("/analytics", isAuthenticate, authorizeRoles("recruiter"), recruiterController.getAnalytics);

module.exports = router;
