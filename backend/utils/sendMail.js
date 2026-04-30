const transporter = require("./mailer");

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail({
      to: user.email,
      subject,
      html,
    });
    
  } catch (err) {
    console.error("Email Error:", err.message);
  }
};

module.exports = sendEmail;
