import { generateToken } from "../lib/utils.js";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
// Sign up new user

export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;

  try {
    if (!email || !fullName || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);
    res.json({
      success: true,
      message: "User created successfully",
      token,
      userData: newUser,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login existing user
// Login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Await is required here
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      message: "User logged in successfully",
      token,
      userData, // this now has fullName, email, etc.
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// authenticated user details

export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// update user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;
    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio, profilePic: upload.secure_url },
        { new: true }
      );
    }
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
