import mongoose from "mongoose";
// import IUser from "./user.interface";

import { IUser } from "./user.interface";

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true }, // PK logic (Firebase UID)
    email: { type: String, required: true, unique: true, index: true},
    name: { type: String },
    password: { type: String, required: true },
    avatar: { type: String },
    xpPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    collection: "users", // Cố định tên collection trong MongoDB
  }
);

export default mongoose.model<IUser & mongoose.Document>("User", UserSchema);
