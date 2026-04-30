const router = require("express").Router();
const ctrl = require("../controllers/notificationController");
const { isAuthenticate } = require("../middleware/isAuthenticated");

router.get("/", isAuthenticate, ctrl.getNotifications);
router.get("/unread", isAuthenticate, ctrl.getUnreadCount);
router.put("/:id/read", isAuthenticate, ctrl.markRead);

module.exports = router;