const Notification = require("../models/Notification");

// get all
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({ notifications });
};

// unread count
exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({ count });
};

// mark read
exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true,
  });

  res.json({ success: true });
};