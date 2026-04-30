const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

require("dotenv").config();

//register

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const allowedRoles = ["student", "recruiter", "admin"];
    let userRole = "student";

    if (role === "recruiter") userRole = "recruiter";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const encryptedPassword = await bcrypt.hash(password, 13);
    const user = await User.create({
      name,
      email,
      password: encryptedPassword,
      role: userRole,
    });
    res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server Error, Registration Failed" });
  }
};

//login

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    //block login if account is deactivated
    if (user.isActive === false) {
      if (user.deactivatedUntil && user.deactivatedUntil > Date.now()) {
        return res.status(403).json({
          error: "Account temporarily deactivated. Try again later.",
          until: user.deactivatedUntil,
        });
      }

      // time expired reactivate account
      user.isActive = true;
      user.deactivatedUntil = null;
      await user.save();
    }

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid Credentials" });

    const token = jwt.sign(
      { userId: user._id, 
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRETKEY,
      { expiresIn: "15D" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "User Login Failed" });
  }
};

//forgot password

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("Sending email to:", email);
    console.log("OTP:", otp);

    const mailOptions = {
      from: process.env.EMAIL_USER || "no-reply@example.com",
      to: email,
      subject: "Your OTP Code",

      text: `
          Your OTP is: ${otp}

            Valid for 5 minutes.
                Do not share this code with anyone.
          `,

        html: `
            <div style="font-family: Arial; text-align: center;">
            <h2>Your OTP</h2>
            <h1 style="color:#008cff;">${otp}</h1>
            <p>Valid for 5 minutes</p>
            <p style="color:red;">Do not share this code</p>
            </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(
          "Ethereal preview URL:",
          nodemailer.getTestMessageUrl(info),
        );
      }
    } catch (emailErr) {
      console.error("Forgot password email error:", emailErr);
      if (process.env.NODE_ENV !== "production") {
        console.log("Development fallback OTP:", otp);
        return res.json({ message: "OTP generated and sent", otp });
      }
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

//reset password

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 13);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ error: "Reset password failed" });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { tokenVersion: 1 },
    });

    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};
