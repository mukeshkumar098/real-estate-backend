import mongoose from "mongoose"



const UserSchema = new mongoose.Schema({
  name: { type: String, },
  email: { type: String,  unique: true },
  password: { type: String,},
  role: { type: String, enum: ['admin', 'seller', 'buyer'], default: 'buyer' },
  profilePicture: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  bio: { type: String },
  phoneNumber: { type: String },
  specialization: { type: String },
  otp: { type: String },                // ✅ Store OTP
  otpExpiresAt: { type: Date }
}, { timestamps: true })

export { UserSchema }


