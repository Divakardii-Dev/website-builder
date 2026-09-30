const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const nodemailer = require("nodemailer");

// REGISTER
exports.register = async (req, res) => {
  try {
 
    // ✅ DEBUG LOG (ADD THIS)
    console.log("BODY RECEIVED:", req.body);
 
    const name = req.body.name?.trim();
    const email = (req.body.email ?? "").trim().toLowerCase();
    const mobile = req.body.mobile?.trim();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
 
    // Required fields — return specific message for empty email before format checks.
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
 
    // email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.(com|in)$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Enter valid email" });
    }
 
    // domain check
    const allowedDomains = ["gmail.com", "yahoo.in", "outlook.com", "thestackly.com"];
    const domain = email.split("@")[1];
 
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({
        message: "Only Gmail, Yahoo, Outlook, Stackly emails are allowed"
      });
    }
 
    // password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
 
    const formattedMobile = mobile.trim();

    // must be 10 digits and not start with 0
    if (!/^[1-9][0-9]{9}$/.test(formattedMobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    // prevent repeated digits (1111111111, 9999999999)
    if (/^(\d)\1{9}$/.test(formattedMobile)) {
      return res.status(400).json({ message: "Invalid number" });
    }
    // password validation
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message: "Password must contain 8 characters, lowercase, uppercase, number and special character"
      });
    }
 
    // check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // check existing mobile
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }
 
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // create user
    await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });
 
     res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      user = await User.findOne({ email: cleanEmail });
    } else if (mobile) {
      const cleanMobile = mobile.trim(); // ✅ FIX ADDED
      user = await User.findOne({ mobile: cleanMobile }); // ✅ FIXED
    }
    
    // ADD THIS BLOCK (Alternate check)
    let userType = "primary"; // default

    if (!user) {
      const inputVal = (email || mobile).trim().toLowerCase();

      const altUser = await User.findOne({
        alternates: inputVal
      });

      if (altUser) {
        user = altUser;
        userType = "alternate";
      }
    }
    //END

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token,
      userType: userType 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FORGOT PASSWORD =================

exports.forgotPassword = async (req, res) => {
try {
const { input, isChange, primaryUser } = req.body;

if (!input) {
return res.status(400).json({
message: "Email or Mobile required"
});
}

const inputVal = input.toLowerCase().trim();

const isEmail = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|yahoo|thestackly)\.(com|in)$/.test(inputVal);
const isMobile = /^[0-9]{10}$/.test(inputVal);

if (!isEmail && !isMobile) {
return res.status(400).json({
message: "Enter valid Email or Mobile"
});
}

/* =========================
   CHANGE MODE
========================= */
if (isChange) {

if (!primaryUser) {
return res.status(400).json({
message: "Primary user required"
});
}

/* 1. FIND PRIMARY USER FIRST */
const primaryVal = primaryUser.toLowerCase().trim();

let user = await User.findOne({
  $or: [
    { email: primaryVal },
    { mobile: primaryVal }
  ]
});

if (!user) {
return res.status(400).json({
message: "Primary user not found"
});
}

/* 2. CHECK IF PRIMARY IS TRYING TO ADD ITSELF */
if (inputVal === user.email || inputVal === user.mobile) {
return res.status(400).json({
message: "Cannot use primary credentials"
});
}

/* 3. TYPE VALIDATION (email vs mobile rule) */
const primaryIsEmail = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|yahoo|thestackly)\.(com|in)$/.test(primaryUser);
const primaryIsMobile = /^[0-9]{10}$/.test(primaryUser);

if (primaryIsEmail && !isEmail) {
return res.status(400).json({
message: "Primary user is email, alternate must be email only"
});
}

if (primaryIsMobile && !isMobile) {
return res.status(400).json({
message: "Primary user is mobile, alternate must be mobile only"
});
}

let userList = Array.isArray(user.alternates) ? user.alternates : [];

const emailList = userList.filter(x =>
  /^[a-zA-Z0-9._%+-]+@(gmail|outlook|yahoo|thestackly)\.(com|in)$/.test(x)
);

const mobileList = userList.filter(x =>
  /^[0-9]{10}$/.test(x)
);

// limit check
if (primaryIsEmail && emailList.length >= 2) {
  return res.status(400).json({
    message: "Maximum 2 email alternates allowed",
    alternates: emailList
  });
}

if (primaryIsMobile && mobileList.length >= 2) {
  return res.status(400).json({
    message: "Maximum 2 mobile alternates allowed",
    alternates: mobileList
  });
}

/* 6. DUPLICATE CHECK (safe) */
if (
  primaryIsEmail &&
  emailList.map(x => x.toLowerCase()).includes(inputVal)
) {
  return res.status(400).json({
    message: "Already added as alternate"
  });
}

if (
  primaryIsMobile &&
  mobileList.includes(inputVal)
) {
  return res.status(400).json({
    message: "Already added as alternate"
  });
}

/* 7. GLOBAL DUPLICATE CHECK */
const existingAlt = await User.findOne({
alternates: inputVal
});

if (existingAlt) {
return res.status(400).json({
message: "Already used as alternate"
});
}

if (!Array.isArray(user.alternates)) {
  user.alternates = [];
}
/* 8. SAVE */
user.alternates.push(inputVal);

const otp = Math.floor(1000 + Math.random() * 9000).toString();

user.otp = otp;
user.otpExpiry = Date.now() + 60 * 1000;
user.otpAttempts = 0;

await user.save();

return res.json({
  message: "Alternate added successfully",
  otp,
  moveToVerify: true
});
}
/* =========================
   NORMAL FLOW
========================= */

const user = await User.findOne({
$or: [
{ email: inputVal },
{ mobile: inputVal },
{ alternates: inputVal }
]
});

if (!user) {
return res.status(400).json({
message: "User not registered"
});
}

/* OTP GENERATION */
const otp = Math.floor(1000 + Math.random() * 9000).toString();

user.otp = otp;
user.otpExpiry = Date.now() + 60 * 1000;
user.otpAttempts = 0;

await user.save();

console.log("OTP:", otp);

res.json({
message: "OTP sent successfully",
otp // remove in production
});

} catch (error) {
res.status(500).json({ message: "Server error" });
}
};

const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_TIME = 60 * 1000; // 1 minute

exports.verifyOtpByEmail = async (req, res) => {
  try {
    let { email, otp, action } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({
      $or: [
        { email },
        { alternates: { $in: [email] }  }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ================= RESEND OTP =================
    if (action === "resend") {

      const isExpired = !user.otpExpiry || Date.now() > user.otpExpiry;
      const isMaxAttempts = user.otpAttempts >= MAX_ATTEMPTS;

      if (!isExpired && !isMaxAttempts) {
        return res.status(400).json({
          message: "Resend allowed only after expiry or max attempts"
        });
      }
      
      user.otpAttempts = 0;

      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

      user.otp = newOtp;
      user.otpExpiry = Date.now() + OTP_EXPIRY_TIME;

      await user.save();

      console.log("Resend Email OTP:", newOtp);

      return res.json({
        message: "OTP resent successfully",
        otp: newOtp 
      });
    }

    // ================= VERIFY OTP =================
    
    if (!otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    const isExpired = !user.otpExpiry || Date.now() > user.otpExpiry;

    if (isExpired) {
        user.otpAttempts = 0;
        await user.save();
        return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(400).json({ message: "Max attempts reached" });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP",
        attemptsLeft: MAX_ATTEMPTS - user.otpAttempts
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
      token: token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.verifyOtpByMobile = async (req, res) => {
  try {
    let { mobile, otp, action } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile required" });
    }

    mobile = mobile.trim();

    const user = await User.findOne({
        $or: [
          { mobile },
          { alternates: mobile }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ================= RESEND OTP =================
    if (action === "resend") {

      const isExpired = !user.otpExpiry || Date.now() > user.otpExpiry;
      const isMaxAttempts = user.otpAttempts >= MAX_ATTEMPTS;

      if (!isExpired && !isMaxAttempts) {
        return res.status(400).json({
          message: "Resend allowed only after expiry or max attempts"
        });
      }

      user.otpAttempts = 0;
    
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

      user.otp = newOtp;
      user.otpExpiry = Date.now() + OTP_EXPIRY_TIME;

      await user.save();

      console.log("Resend Mobile OTP:", newOtp);

      return res.json({
        message: "OTP resent successfully",
        otp: newOtp 
      });
    }

    // ================= VERIFY OTP =================
    if (!otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    const isExpired = !user.otpExpiry || Date.now() > user.otpExpiry;

    if (isExpired) {
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(400).json({ message: "Max attempts reached" });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP",
        attemptsLeft: MAX_ATTEMPTS - user.otpAttempts
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
      token: token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {

    let { newPassword, confirmPassword } = req.body;

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Invalid token received" });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Session expired. Please verify OTP again."
        });
      }

      return res.status(401).json({
        message: "Invalid token"
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // validations
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      return res.status(400).json({ message: "Confirm password is required" });
    }

    newPassword = newPassword.trim();
    confirmPassword = confirmPassword.trim();

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // password validation
    const errors = [];

    if (!/.{8,}/.test(newPassword)) errors.push("Min 8 chars");
    if (!/[A-Z]/.test(newPassword)) errors.push("1 uppercase");
    if (!/[a-z]/.test(newPassword)) errors.push("1 lowercase");
    if (!/[0-9]/.test(newPassword)) errors.push("1 number");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)) errors.push("1 special char");

    if (errors.length > 0) {
      return res.status(400).json({
      errors: errors
    });
  }

    // reuse check
    const allPasswords = [user.password, ...(user.passwordHistory || [])];

    for (let oldPass of allPasswords) {
      const isMatch = await bcrypt.compare(newPassword, oldPass);
      if (isMatch) {
        return res.status(400).json({
          message: "Cannot use last 3 passwords"
        });
      }
    }

    // save password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, {
  password: hashedPassword,
  $push: {
    passwordHistory: {
      $each: [user.password],
      $slice: -3
    }
  },
  otp: null,
  otpExpiry: null,
  otpAttempts: 0
});

    console.log("Password Updated Successfully");

    return res.json({
      message: "Password reset successfully"
    });

  } catch (err) {
    console.error("RESET ERROR:", err);

    return res.status(500).json({
      message: "Server error"
    });
  }
};
