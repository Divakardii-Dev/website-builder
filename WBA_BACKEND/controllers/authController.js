const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const nodemailer = require("nodemailer");

// REGISTER
exports.register = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    // =========================
    // GET FORM DATA
    // =========================

    const rawName = req.body.name || "";

    // remove extra spaces
    const trimmedName = rawName.trim();
    const name = trimmedName.replace(/\s+/g, " ");

    const email = req.body.email?.trim().toLowerCase() || "";

    // frontend sends: +918877665541
    const mobile = req.body.mobile?.trim() || "";

    // convert to 10 digit mobile
    const formattedMobile = mobile.replace(/\D/g, "").slice(-10);

    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || "";

    // =========================
    // EMPTY FIELD VALIDATION
    // =========================

    if (
      !name ||
      !email ||
      !formattedMobile ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // =========================
    // NAME VALIDATION
    // =========================

    if (name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return res.status(400).json({
        message: "Name must contain only letters",
      });
    }

    // =========================
    // EMAIL VALIDATION
    // =========================

    const emailPattern = /^[^\s@]+@[^\s@]+\.(com|in)$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Enter valid email",
      });
    }

    const allowedDomains = [
      "gmail.com",
      "yahoo.in",
      "outlook.com",
      "thestackly.com",
    ];

    const domain = email.split("@")[1];

    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({
        message:
          "Only Gmail, Yahoo, Outlook, Stackly emails are allowed",
      });
    }

    // =========================
    // MOBILE VALIDATION
    // =========================

    // only digits
    if (!/^\d+$/.test(formattedMobile)) {
      return res.status(400).json({
        message: "Mobile number must contain only digits",
      });
    }

    // exactly 10 digits
    if (formattedMobile.length !== 10) {
      return res.status(400).json({
        message: "Number must contain 10 digits",
      });
    }

    // should not start with 0
    if (formattedMobile.startsWith("0")) {
      return res.status(400).json({
        message: "Number should not start with 0",
      });
    }

    // repeated pair pattern
    const repeatedPairPattern = /^(\d{2})\1{4}$/;

    if (repeatedPairPattern.test(formattedMobile)) {
      return res.status(400).json({
        message: "Pair of Numbers Not Allowed",
      });
    }

    // same numbers
    if (/^(\d)\1{9}$/.test(formattedMobile)) {
      return res.status(400).json({
        message: "Same numbers not allowed",
      });
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================

    if (/\s/.test(password)) {
      return res.status(400).json({
        message: "Password should not contain spaces",
      });
    }

    if (/\s/.test(confirmPassword)) {
      return res.status(400).json({
        message: "Confirm Password should not contain spaces",
      });
    }

    // password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // password pattern
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain 8 characters, uppercase, lowercase, number and special character",
      });
    }

    // =========================
    // CHECK EXISTING EMAIL
    // =========================

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // =========================
    // CHECK EXISTING MOBILE
    // =========================

    const existingMobile = await User.findOne({
      mobile: formattedMobile,
    });

    if (existingMobile) {
      return res.status(400).json({
        message: "Mobile number already exists",
      });
    }

    // =========================
    // HASH PASSWORD
    // =========================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // CREATE USER
    // =========================

    await User.create({
      name,
      email,
      mobile: formattedMobile,
      password: hashedPassword,
    });

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;

    if (!password || (!email && !mobile)) {
      return res.status(400).json({
        message: "Email or mobile and password are required"
      });
    }

    let user;
    let userType = "primary";

    // ================= PRIMARY LOGIN =================
    if (email) {
      const cleanEmail = email.trim().toLowerCase();

      const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|in|org|net|edu)$$/i;

      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          field: "email",
          message: "Invalid email id"
        });
      }

      user = await User.findOne({
        email: cleanEmail
      });

    } else if (mobile) {
      const cleanMobile = mobile.trim();

      user = await User.findOne({
        mobile: cleanMobile
      });
    }

    // ================= ALTERNATE LOGIN =================
    if (!user) {
      const inputVal = email
        ? email.trim().toLowerCase()
        : mobile.trim();

      const altUser = await User.findOne({
        alternates: inputVal
      });

      if (altUser) {
        user = altUser;
        userType = "alternate";
      }
    }

    // ================= USER CHECK =================
    if (!user) {
      return res.status(400).json({
        field: email ? "email" : "mobile",
        message: email
          ? "Email not registered"
          : "Mobile number not registered"
      });
    }

    // ================= PASSWORD CHECK =================
    if (!password.trim()) {
      return res.status(400).json({
        field: "password",
        message: "Password is required"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        field: "password",
        message: "Incorrect password"
      });
    }

    // ================= TOKEN =================
    const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

    return res.json({
      message: "Login successful",
      token,
      userType
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
  
exports.forgotPassword = async (req, res) => {
  try {
    const { input, isChange, primaryUser } = req.body;

    if (!input) {
      return res.status(400).json({
        message: "Email or mobile number is required",
      });
    }

    // ---------- Normalize input (MATCH FRONTEND: NO EXTRA RULES) ----------
    const inputVal = String(input).trim();
    const inputLower = inputVal.toLowerCase();

    // ---------- EMAIL VALIDATION (match frontend allowed rules) ----------
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$$/.test(inputLower);

    // Allowed domains (same idea as frontend)
    const allowedDomains = [
      "gmail.com",
      "yahoo.in",
      "outlook.com",
      "thestackly.com",
    ];

    const emailDomain = isEmail ? inputLower.split("@")[1] : null;
    const isAllowedEmail =
      isEmail && allowedDomains.includes(emailDomain);

    // ---------- MOBILE VALIDATION ----------
    const isMobile = /^[0-9]{6,15}$$/.test(inputVal);

    // final validation (same as frontend decision)
    if (!isAllowedEmail && !isMobile) {
      return res.status(400).json({
        message: "Enter a valid email or mobile number",
      });
    }

    /* =========================
       CHANGE MODE
    ========================= */
    if (isChange) {
      if (!primaryUser) {
        return res.status(400).json({
          message: "Primary user required",
        });
      }

      const primaryVal = primaryUser.toLowerCase().trim();

      const primaryUserDoc = await User.findOne({
        $or: [{ email: primaryVal }, { mobile: primaryVal }],
      });

      if (!primaryUserDoc) {
        return res.status(400).json({
          message: "Primary user not found",
        });
      }

      // cannot reuse same credential
      if (inputLower === primaryUserDoc.email || inputVal === primaryUserDoc.mobile) {
        return res.status(400).json({
          message: "Cannot use primary credentials",
        });
      }

      const primaryIsEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$$/.test(primaryVal);
      const primaryIsMobile = /^[0-9]{6,15}$$/.test(primaryVal);

      // type mismatch rules
      if (primaryIsEmail && !isAllowedEmail) {
        return res.status(400).json({
          message: "Primary user is email, alternate must be email only",
        });
      }

      if (primaryIsMobile && !isMobile) {
        return res.status(400).json({
          message: "Primary user is mobile, alternate must be mobile only",
        });
      }

      let alternates = Array.isArray(primaryUserDoc.alternates)
        ? primaryUserDoc.alternates
        : [];

      const emailList = alternates.filter((x) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$$/.test(x)
      );

      const mobileList = alternates.filter((x) =>
        /^[0-9]{6,15}$$/.test(x)
      );

      // limit 2
      if (primaryIsEmail && emailList.length >= 2) {
        return res.status(400).json({
          message: "Maximum 2 email alternates allowed",
        });
      }

      if (primaryIsMobile && mobileList.length >= 2) {
        return res.status(400).json({
          message: "Maximum 2 mobile alternates allowed",
        });
      }

      // duplicate check
      if (
        primaryIsEmail &&
        emailList.map((x) => x.toLowerCase()).includes(inputLower)
      ) {
        return res.status(400).json({
          message: "Already added as alternate",
        });
      }

      if (primaryIsMobile && mobileList.includes(inputVal)) {
        return res.status(400).json({
          message: "Already added as alternate",
        });
      }

      // global duplicate check
      const existing = await User.findOne({
        alternates: isAllowedEmail
          ? inputLower
          : inputVal,
      });

      if (existing) {
        return res.status(400).json({
          message: "Already used as alternate",
        });
      }

      // OTP generation
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const normalizedAlternate = isAllowedEmail
        ? inputLower
        : inputVal;

      primaryUserDoc.pendingAlternate = normalizedAlternate;
      primaryUserDoc.otp = otp;
      primaryUserDoc.otpExpiry = Date.now() + 60 * 1000;
      primaryUserDoc.otpAttempts = 0;

      await primaryUserDoc.save();      

      return res.json({
        message: "OTP sent successfully",
        otp,
        moveToVerify: true,
        pendingAlternate: normalizedAlternate,
      });
    }

    /* =========================
       NORMAL FORGOT PASSWORD FLOW
    ========================= */

    const user = await User.findOne({
      $or: [
        { email: inputLower },
        { mobile: inputVal },
        { alternates: inputLower },
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 60 * 1000;
    user.otpAttempts = 0;

    await user.save();

    return res.json({
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_TIME = 60 * 1000;

exports.verifyOtpByEmail = async (req, res) => {
  try {
    let { email, otp, action } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email required",
      });
    }

    email = String(email).toLowerCase().trim();

    const user = await User.findOne({
      $or: [
        { email },
        { alternates: email },
        { pendingAlternate: email },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ================= RESEND OTP =================
    if (action === "resend") {
      const isExpired =
        !user.otpExpiry || Date.now() > user.otpExpiry;

      const isMaxAttempts =
        user.otpAttempts >= MAX_ATTEMPTS;

      // ⚠️ FIX: frontend allows resend even if expired OR blocked
      if (!isExpired && !isMaxAttempts) {
        return res.status(400).json({
          message:
            "Please wait for OTP to expire or reach max attempts",
        });
      }

      user.otpAttempts = 0;

      const newOtp = Math.floor(
        1000 + Math.random() * 9000
      ).toString();

      user.otp = newOtp;
      user.otpExpiry = Date.now() + OTP_EXPIRY_TIME;
      user.otpAttempts = 0;

      await user.save();

      console.log("Resend OTP:", newOtp);

      return res.json({
        message: "OTP resent successfully",
        otp: newOtp,
      });
    }

    // ================= VERIFY OTP =================
    if (!otp) {
      return res.status(400).json({
        message: "Please enter the complete 4-digit code.",
      });
    }

    const isExpired =
      !user.otpExpiry || Date.now() > user.otpExpiry;

    if (isExpired) {
      user.otp = null;
      user.otpAttempts = 0;
      await user.save();

      return res.status(400).json({
        message: "OTP expired. Please Resend code.",
      });
    }

    if (user.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(400).json({
        message:
          "Maximum attempts reached. Please resend OTP.",
        attemptsLeft: 0,
      });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;

      const attemptsLeft =
        MAX_ATTEMPTS - user.otpAttempts;

      await user.save();

      if (attemptsLeft <= 0) {
        return res.status(400).json({
          message:
            "Maximum attempts reached. Please Resend code.",
          attemptsLeft: 0,
        });
      }

      return res.status(400).json({
        message: `Invalid OTP. ${attemptsLeft} attempt${
          attemptsLeft > 1 ? "s" : ""
        } left.`,
        attemptsLeft,
      });
    }

    // ================= SUCCESS =================
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.json({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error("OTP VERIFY ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.verifyOtpByMobile = async (req, res) => {
  try {
    let { mobile, otp, action } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile required",
      });
    }

    mobile = String(mobile).trim();

    const user = await User.findOne({
      $or: [
        { mobile },
        { alternates: mobile },
        { pendingAlternate: mobile },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ================= RESEND OTP =================
    if (action === "resend") {
      const isExpired =
        !user.otpExpiry || Date.now() > user.otpExpiry;

      const isMaxAttempts =
        user.otpAttempts >= MAX_ATTEMPTS;

      // 🔥 FIX: match frontend UX (allow resend after expiry OR max attempts)
      if (!isExpired && !isMaxAttempts) {
        return res.status(400).json({
          message:
            "Please wait for OTP to expire or max attempts reached",
        });
      }

      user.otpAttempts = 0;

      const newOtp = Math.floor(
        1000 + Math.random() * 9000
      ).toString();

      user.otp = newOtp;
      user.otpExpiry = Date.now() + OTP_EXPIRY_TIME;
      user.otpAttempts = 0;

      await user.save();

      return res.json({
        message: "OTP resent successfully",
        otp: newOtp,
      });
    }

    // ================= VERIFY OTP =================
    if (!otp) {
      return res.status(400).json({
        message: "Please enter the complete 4-digit code.",
      });
    }

    const isExpired =
      !user.otpExpiry || Date.now() > user.otpExpiry;

    if (isExpired) {
      user.otp = null;
      user.otpAttempts = 0;
      await user.save();

      return res.status(400).json({
        message: "OTP expired. Please Resend code.",
      });
    }

    if (user.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(400).json({
        message:
          "Maximum attempts reached. Please Resend code.",
        attemptsLeft: 0,
      });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;

      const attemptsLeft =
        MAX_ATTEMPTS - user.otpAttempts;

      await user.save();

      if (attemptsLeft <= 0) {
        return res.status(400).json({
          message:
            "Maximum attempts reached. Please Resend code.",
          attemptsLeft: 0,
        });
      }

      return res.status(400).json({
        message: `Invalid OTP. ${attemptsLeft} attempt${
          attemptsLeft > 1 ? "s" : ""
        } left.`,
        attemptsLeft,
      });
    }

    // ================= SUCCESS =================
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.json({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error("MOBILE OTP ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let { newPassword, confirmPassword } = req.body;

    const authHeader = req.headers.authorization;

    // Token validation
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token missing or invalid format",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        message: "Invalid token received",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const decodedToken = jwt.decode(token);

        if (decodedToken?.userId) {
          await User.findByIdAndUpdate(decodedToken.userId, {
            pendingAlternate: null,
          });
        }

        return res.status(401).json({
          message: "Session expired. Please verify OTP again.",
        });
      }

      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ---------------- PASSWORD VALIDATION ----------------

    const PASSWORD_MIN_LENGTH = 8;
    const PASSWORD_MAX_LENGTH = 60;

    const PASSWORD_LENGTH_ERROR =
      "Password must be 8-60 characters.";

    const PASSWORD_WHITESPACE_ERROR =
      "Password cannot contain spaces.";

    const PASSWORD_UPDATE_ERROR =
      "Cannot update password. Please follow password requirements.";

    // Required validation
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      return res.status(400).json({
        message: "Confirm password is required",
      });
    }

    // Do NOT trim passwords (match frontend)
    if (/\s/.test(newPassword) || /\s/.test(confirmPassword)) {
      return res.status(400).json({
        message: PASSWORD_WHITESPACE_ERROR,
      });
    }

    // Match frontend validation order
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (
      newPassword.length < PASSWORD_MIN_LENGTH ||
      newPassword.length > PASSWORD_MAX_LENGTH ||
      confirmPassword.length > PASSWORD_MAX_LENGTH
    ) {
      return res.status(400).json({
        message: PASSWORD_LENGTH_ERROR,
      });
    }

    // Password complexity validation
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      return res.status(400).json({
        message: PASSWORD_UPDATE_ERROR,
      });
    }

    // ---------------- REUSE CHECK ----------------

    const allPasswords = [
      user.password,
      ...(user.passwordHistory || []),
    ];

    for (const oldPass of allPasswords) {
      const isMatch = await bcrypt.compare(
        newPassword,
        oldPass
      );

      if (isMatch) {
        return res.status(400).json({
          message: "Cannot use last 3 passwords",
        });
      }
    }

    // ---------------- SAVE PASSWORD ----------------

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Build push object separately
    const pushData = {
      passwordHistory: {
        $each: [user.password],
        $slice: -3,
      },
    };

    // Save alternate only after password reset
    if (user.pendingAlternate) {
      pushData.alternates = user.pendingAlternate.trim();
    }

    const updateData = {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      pendingAlternate: null,
      $push: pushData,
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    );

    console.log(
      "Saved alternates:",
      updatedUser.alternates
    );
    console.log("Password Updated Successfully");

    return res.json({
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error("RESET ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
