const router = require("express").Router();
const ctrl = require("../controllers/settingController");
const { isAuthenticate } = require("../middleware/isAuthenticated");

router.get("/", isAuthenticate, ctrl.getSettings);
router.put("/", isAuthenticate, ctrl.updateSettings);
router.put("/password", isAuthenticate, ctrl.changePassword);
router.post("/logout-all", isAuthenticate, ctrl.logoutAll);

module.exports = router;
