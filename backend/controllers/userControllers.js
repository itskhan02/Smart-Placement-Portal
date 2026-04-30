const User = require("../models/User");
const dns = require("dns");
const nodemailer = require("nodemailer");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

const resolveMx = promisify(dns.resolveMx);

// get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("profile.company");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

exports.getUserById = async (req,res) => {
  try {
    const {id} = req.params;
    const user = await User.findById(id).select("-password").populate("profile.company");
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({error: " Failed to fetch user"});
  }
};

// update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const body = req.body;

    let updateData = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) updateData.name = body.name;
    if (Object.prototype.hasOwnProperty.call(body, "bio")) updateData["profile.bio"] = body.bio;
    if (Object.prototype.hasOwnProperty.call(body, "location")) updateData["profile.location"] = body.location;


    if (role === "student") {
      if (Object.prototype.hasOwnProperty.call(body, "skills")) updateData["profile.skills"] = body.skills;
      if (Object.prototype.hasOwnProperty.call(body, "education")) updateData["profile.education"] = body.education;
      if (Object.prototype.hasOwnProperty.call(body, "experience")) updateData["profile.experience"] = body.experience;
    }

    if (role === "recruiter") {
      if (Object.prototype.hasOwnProperty.call(body, "designation"))
        updateData["profile.designation"] = body.designation;

      if (Object.prototype.hasOwnProperty.call(body, "experienceYears"))
        updateData["profile.experienceYears"] = body.experienceYears;

      if (Object.prototype.hasOwnProperty.call(body, "skills"))
        updateData["profile.skills"] = body.skills;

      if (Object.prototype.hasOwnProperty.call(body, "linkedin"))
        updateData["profile.linkedin"] = body.linkedin;

      if (Object.prototype.hasOwnProperty.call(body, "company"))
        updateData["profile.company"] = body.company;

      if (Object.prototype.hasOwnProperty.call(body, "companyWebsite"))
        updateData["profile.companyWebsite"] = body.companyWebsite;

      if (Object.prototype.hasOwnProperty.call(body, "industry"))
        updateData["profile.industry"] = body.industry;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ user: updatedUser });

  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

// profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        "profile.profilePicture": `/uploads/profiles/${req.file.filename}`,
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile picture updated",
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to update profile picture" });
  }
};

// skills
exports.addSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { "profile.skills": skills },
      { new: true }
    ).select("-password");

    res.json({
      message: "Skills updated",
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to update skills" });
  }
};

// education
exports.addEducation = async (req, res) => {
  try {
    const { education } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { "profile.education": education } },
      { new: true }
    ).select("-password");

    res.json({
      message: "Education added",
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to update education" });
  }
};

// experience
exports.addExperience = async (req, res) => {
  try {
    const { experience } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { "profile.experience": experience } },
      { new: true }
    ).select("-password");

    res.json({
      message: "Experience added",
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to update experience" });
  }
};

// delete education
exports.deleteEducation = async (req, res) => {
  try {
    const { index } = req.params;

    const user = await User.findById(req.user._id);

    if (index < 0 || index >= user.profile.education.length) {
      return res.status(400).json({ error: "Invalid education index" });
    }

    user.profile.education.splice(index, 1);
    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    res.json({
      message: "Education deleted",
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete education" });
  }
};

// delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const { index } = req.params;

    const user = await User.findById(req.user._id);

    if (index < 0 || index >= user.profile.experience.length) {
      return res.status(400).json({ error: "Invalid experience index" });
    }

    user.profile.experience.splice(index, 1);
    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    res.json({
      message: "Experience deleted",
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete experience" });
  }
};

// resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    if (user.profile?.resume?.fileUrl) {
      const oldPath = path.join(__dirname, "..", user.profile.resume.fileUrl);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profile.resume = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    await user.save();

    res.json({
      message: "Resume uploaded successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload resume" });
  }
};


//email update OTP
exports.sendEmailUpdateOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOtp = otp;
    user.emailOtpExpiry = Date.now() + 5 * 60 * 1000;
    user.emailOtpPurpose = "EMAIL_UPDATE";

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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Email Update OTP",

      text: `Your OTP is: ${otp}`,

      html: `
        <div style="font-family: Arial; text-align: center;">
          <h2>Email Update Verification</h2>
          <h1 style="color:#008cff;">${otp}</h1>
          <p>Valid for 5 minutes</p>
          <p style="color:red;">Do not share this code</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to your current email" });

  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// verify email update OTP

exports.verifyEmailUpdateOtp = async (req, res) => {
  try {
    const { otp, newEmail } = req.body;

    const user = await User.findById(req.user._id);

    if (
      user.emailOtp !== otp ||
      user.emailOtpExpiry < Date.now() ||
      user.emailOtpPurpose !== "EMAIL_UPDATE"
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const domain = newEmail.split("@")[1];

    let mxRecords;
    try {
      mxRecords = await resolveMx(domain);
    } catch (err) {
      return res.status(400).json({ error: "Email domain does not exist" });
    }

    if (!mxRecords || mxRecords.length === 0) {
      return res.status(400).json({ error: "Invalid email domain" });
    }

    const exists = await User.findOne({ email: newEmail });
    if (exists) {
      return res.status(400).json({ error: "Email already in use" });
    }

    user.email = newEmail;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    user.emailOtpPurpose = null;

    await user.save();

    res.json({ message: "Email updated successfully", user });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Verification failed" });
  }
};


//deactivate account
exports.deactivateUser = async (req, res) => {
  try {
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isActive: false,
        deactivatedUntil: new Date(Date.now() + 10 * 1000),
      },
      { new: true },
    );

    res.json({
      message: "Account temporarily deactivated",
      until: user.deactivatedUntil,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate account" });
  }
};

//delete account
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Account deleted permanently" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
};
