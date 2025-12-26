import mongoose from "mongoose";
import { IFriendRequest } from "./user.interface";

const FriendRequestSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true, ref: 'User' },
    receiverId: { type: String, required: true, ref: 'User' },
    status: { 
      type: String, 
      enum: ["pending", "accepted", "rejected"], 
      default: "pending" 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: "friend_requests",
    timestamps: true
  }
);

// Index để tìm kiếm nhanh
FriendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
FriendRequestSchema.index({ receiverId: 1, status: 1 });

export default mongoose.model<IFriendRequest & mongoose.Document>("FriendRequest", FriendRequestSchema);