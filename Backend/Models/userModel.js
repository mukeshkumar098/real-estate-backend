import mongoose from "mongoose";
import { UserSchema } from "../Schemas/userSchema.js";

const userModel = mongoose.model("User", UserSchema);

export { userModel };
