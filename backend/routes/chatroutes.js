const router = require("express").Router();
const { createMessages, getContacts, getMessages } = require("../controllers/chatController");
const { isAuthenticate } = require("../middleware/isAuthenticated");

router.post("/", isAuthenticate, createMessages);
router.get("/contacts", isAuthenticate, getContacts);
router.get("/:receiverId", isAuthenticate, getMessages);


module.exports = router;
