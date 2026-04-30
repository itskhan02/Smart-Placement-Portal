const Report = require("../models/Report");
const Notification = require("../models/Notification");
const User = require("../models/user");

exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, category, description, source } = req.body;

    const report = await Report.create({
      reportedUser: reportedUserId,
      reportedBy: req.user._id,
      category,
      description,
      source,
    });

    const admin = await User.findOne({ role: "admin" });

    if (admin) {
      const notification = await Notification.create({
        user: admin._id,
        role: "admin",
        type: "REPORT",
        title: "New Report",
        message: "A user has been reported",
      });

      const io = req.app.get("io");
      if (io) {
        io.to(admin._id.toString()).emit("notification", notification);
      }
    }

    res.json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to submit report",
    });
  }
};
