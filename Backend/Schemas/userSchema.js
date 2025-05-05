import mongoose  from "mongoose"



const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "seller","buyer"], default: "buyer" },
    profilePicture: { type: String, default: "" },
    isVerified: { type: Boolean, default: false } 
    }, { timestamps: true })

export {UserSchema}


