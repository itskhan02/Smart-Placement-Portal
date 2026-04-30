const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { isAuthenticate, authorizeRoles,} = require("../middleware/isAuthenticated");
const {upload} = require("../middleware/upload");

router.get("/dashboard", isAuthenticate, authorizeRoles("student"), studentController.getDashboard);


module.exports = router;
