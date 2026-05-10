import bcrypt from "bcryptjs";
import { OTP } from "../models/OTP.js";
import user from "../models/User.js";
import { sendOTPEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.SECRET_KEY, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await user.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists. Please login." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await user.create({
      name,
      email,
      password: hashPassword,
      role: "user",
      isVerified: false,
    });

    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    console.log(`OTP for ${email} is ${otp}`);

    await OTP.create({ email, otp, action: "account_verification" });

    await sendOTPEmail(email, otp, "account_verification");

    return res
      .status(201)
      .json({ message: "Check email to verify OTP", email: newUser.email });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await user.findOne({ email });
    if (!userData) {
      return res.status(404).json({ message: "user not found" });
    }

    const verify = await bcrypt.compare(password, userData.password);

    if (!verify) {
      return res.status(400).json({ message: "Password is wrong" });
    }

    if (!userData.isVerified && userData.role === "user") {
      const otp = Math.floor(Math.random() * 900000 + 100000).toString();
      await OTP.deleteMany({ email, action: "account_verification" });

      await OTP.create({ email, otp, action: "account_verification" });

      await sendOTPEmail(email, otp, "account_verification");
      return res.status(400).json({
        message: "Account is not verified, a new OTP is send",
      });
    }
    res.status(200).json({
      message: "User logged in successfully",
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      token: generateToken(userData._id, userData.name),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const checkOTP = await OTP.findOne({
      email,
      otp,
      action: "account_verification",
    });

    if (!checkOTP) {
      return res.status(400).json({ message: "OTP entered is not correct." });
    }

    const verifiedUser = await user.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );
    await OTP.deleteMany({ email, action: "account_verification" });
    res.status(200).json({
      message: "account verified successfully",
      _id: verifiedUser._id,
      name: verifiedUser.name,
      email: verifiedUser.email,
      role: verifiedUser.role,
      token: generateToken(verifiedUser._id, verifiedUser.name),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
