const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { isAuthenticate } = require("../middleware/isAuthenticated");


router.post("/", isAuthenticate, reportController.createReport);

module.exports = router;
