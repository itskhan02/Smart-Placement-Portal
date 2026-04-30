const Notification = require("../models/Notification");
const User = require("../models/User");
const sendEmail = require("../utils/sendMail");

const typeToInAppSetting = {
  APPLICATION_SUBMITTED: "applicants",
  APPLICATION_STATUS: "applicants",
  INTERVIEW: "interviews",
  MESSAGE: "messages",
  JOB: "jobAlerts",
  SECURITY: "system",
  SYSTEM: "system",
  REPORT: "system",
  ALERT: "system",
};

const typeToEmailSetting = {
  APPLICATION_SUBMITTED: "applications",
  APPLICATION_STATUS: "applications",
  INTERVIEW: "interviews",
  MESSAGE: "messages",
};

exports.notify = async ({
  userId,
  role,
  type,
  title,
  message,
  link = "",
  data = {},
  io,
}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const inAppSettings = user.settings?.notifications?.inApp;
    const emailSettings = user.settings?.notifications?.email;

    let notificationDoc = null;

    const inAppKey = typeToInAppSetting[type];
    if (inAppKey && inAppSettings?.[inAppKey] !== false) {
      notificationDoc = await Notification.create({
        user: userId,
        role,
        type,
        title,
        message,
        link,
        data,
      });

      if (io) {
        io.to(userId.toString()).emit("newNotification", notificationDoc);
      }
    }

   //email notification
    const emailKey = typeToEmailSetting[type];

    if (emailSettings?.enabled && emailKey && emailSettings?.[emailKey]) {
      await sendEmail({
        to: user.email,
        subject: title,
        text: message,
        html: `
          <div style="font-family: Arial;">
            <h2>${title}</h2>
            <p>${message}</p>
            ${
              link
                ? `<a href="${link}" style="color:blue;">View Details</a>`
                : ""
            }
            <p style="color:gray;">SmartPlace Notification</p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.log("Notification Error:", err.message);
  }
};
