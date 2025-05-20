import { userModel } from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// User Registration
const userRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "admin") {
      const adminExists = await userModel.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(403).json({ message: "An Admin already exists!" });
      }
    }

    const saltRounds = parseInt(process.env.SALT_ROUND) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// User Login
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Token generation failed" });
        }

        res.json({
          token,
          user: { id: user._id,profilePicture:user.profilePicture, name: user.name, email: user.email, role: user.role },
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email)
    if (!email) {
      return res.status(400).send({ message: "please provide valid email" });
    }
    const checkUser = await userModel.findOne({ email });
    if (!checkUser) {
      return res
        .status(400)
        .send({ message: "user not found please register" });
    }
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    console.log("Generated reset token:", token);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD
      },
    });


    console.log(transporter);
    
    const receiver = {
      from: "",
      to: email,
      subject: "password reset request",
      text: `Click this link to reset your password: ${resetLink}`,
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}" target="_blank" 
          style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };
    await transporter.sendMail(receiver);

    return res
      .status(200)
      .send({
        message: "password reset link send successfully on your gmail account",
      });
  } catch (error) {
    res.status(400).send({ message: "something went wrong!" });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).send({ message: "Please provide a password!" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).send({ message: "User not found!" });
    }

    bcrypt.hash(password, +process.env.SALT_ROUNDS, async (err, hash) => {
      if (err) {
        return res.status(500).send({ message: "Error while resetting password!" });
      }
      await user.updateOne({ password: hash });
      res.status(200).send({ success: true, message: "User password reset successfully" });
    });
  } catch (error) {
    res.status(400).send({ message: "Something went wrong!" });
  }
};

export const getUnverifiedSellers = async (req, res) => {
  try {
    const unverifiedSellers = await userModel.find({ role: 'seller', isVerified: false });
    res.status(200).json(unverifiedSellers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unverified sellers', error: error.message });
  }
};


export const getverifiedSellers = async (req, res) => {
  try {
    const verifiedSellers = await userModel.find({ role: 'seller', isVerified: true });
    res.status(200).json(verifiedSellers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unverified sellers', error: error.message });
  }
};

const unlinkAsync = promisify(fs.unlink);

// Configure upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads/profile-pictures');
const PUBLIC_URL = '/uploads/profile-pictures';

// Ensure upload directory exists
const ensureUploadDir = async () => {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user?.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching profile',
            error: error.message 
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        await ensureUploadDir();

        const {
            name,
            email,
            phoneNumber,
            bio
        } = req.body;

        const userId = req.user?.id;
        const file = req.file;

        if (file && !fs.existsSync(file.path)) {
            throw new Error('Uploaded file not found');
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (bio) updateData.bio = bio;

        // Handle profile picture upload
        if (file) {
            if (user.profilePicture) {
                const oldPath = path.join(process.cwd(), user.profilePicture);
                if (fs.existsSync(oldPath)) {
                    await unlinkAsync(oldPath);
                }
            }

            const filename = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(UPLOAD_DIR, filename);

            if (!fs.existsSync(file.path)) {
                throw new Error('Temporary file not found');
            }

            await fs.promises.rename(file.path, filePath);

            updateData.profilePicture = `${PUBLIC_URL}/${filename}`;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            await unlinkAsync(req.file.path).catch(console.error);
        }

        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating password',
            error: error.message 
        });
    }
};




export const getUserById=async(req,res)=>{
  try {
    const user = await userModel.findById(req.user.id).select("-password"); // Don't return the password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
}


// export const updateUserProfile = async (req, res) => {
//   try {
//     const { name, email, profilePicture } = req.body;
//     const userId = req.user?.id; // Ensure user ID exists
// console.log(name,email,"dasldmaklkml");

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized. User ID not found." });
//     }

  

//     // Log incoming data
//     console.log("Incoming update request for user:", userId);
//     console.log("Request body:", req.body);

//     const updateFields = {};
//     if (name) updateFields.name = name;
//     if (email) {
//       const existingUser = await userModel.findOne({ email });
//       if (existingUser && existingUser._id.toString() !== userId) {
//         return res.status(400).json({ message: "Email is already taken." });
//       }
//       updateFields.email = email;
//     }
//     if (profilePicture) updateFields.profilePicture = profilePicture;

//     // Ensure there is at least one field to update
//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({ message: "No valid fields provided for update." });
//     }

//     // Perform update
//     const updatedUser = await userModel.findByIdAndUpdate(
//       userId,
//       { $set: updateFields },
//       { new: true, runValidators: true } // runValidators enforces schema validation
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     return res.status(200).json({
//       message: "Profile updated successfully.",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Profile update error:", error);
//     return res.status(500).json({
//       message: "Server error. Failed to update profile.",
//       error: error.message,
//     });
//   }
// };




export { userRegister, userLogin, forgetPassword, resetPassword };
