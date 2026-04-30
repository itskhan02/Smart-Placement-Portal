const User = require("../models/User");
const bcrypt = require("bcryptjs");

// get settings
exports.getSettings = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      settings: {
        notifications: user.settings?.notifications || {},
        appearance: user.settings?.appearance || {},

        user: {
          role: user.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// update settings
exports.updateSettings = async (req, res) => {
  try {
    const { path, value, ...fullUpdates } = req.body;
    let updateQuery = {};

    if (path && value !== undefined) {
      // Path-based update
      updateQuery = { $set: { [`settings.${path}`]: value } };
    } else {
      // Full settings update
      updateQuery = { $set: { settings: fullUpdates } };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateQuery,
      { new: true },
    );

    res.json({ settings: user.settings });
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};

// change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Incorrect current password" });
  }

  user.password = await bcrypt.hash(newPassword, 13);
  await user.save();

  res.json({ message: "Password updated successfully" });
};

// logout from all devices
exports.logoutAll = async (req, res) => {

  res.json({
    message: "Logged out from all devices (client should clear token)",
  });
};
