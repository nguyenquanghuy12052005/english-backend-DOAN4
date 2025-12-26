// Thay vì export default

export interface IFriendRequest  {
  senderId: string;      // Người gửi
  receiverId: string;    // Người nhận
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  userId: string;
  email: string;
  name?: string;
  password?: string;
  avatar?: string;
  xpPoints: number;
  level: number;
  createdAt: Date;
  role: "user" | "admin";

   friends: string[]; // Danh sách ID của bạn bè
   pendingRequests: string[]; // ID của người đã gửi kb
   sentRequests: string[]; // ID của người mà user này  đã gửi kb đến
}