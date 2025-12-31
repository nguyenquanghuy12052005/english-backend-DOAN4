import { httpException } from '../../core/exceptions';
import { isEmptyObj } from '../../core/utils';
import { DataStoredInToken, TokenData } from '../auth';
import RegisterDto from './dtos/register.dtos';
import UserSchema from './user.model';
import FriendRequestSchema from './friendRequest.model';
import gravatar from 'gravatar';
import bcryptjs from 'bcryptjs';
import { IFriendRequest, IUser } from './user.interface';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IPagination } from '../../core/interface';
import SocketService from '../../core/socket/socket'; 


class UserService {
    public userSchema = UserSchema;
    public friendRequestSchema = FriendRequestSchema;

    // --- AUTH METHODS ---

    public async createUser(model: RegisterDto): Promise<TokenData> {
        if (isEmptyObj(model)) throw new httpException(400, 'Lỗi: Dữ liệu đăng ký rỗng');
        const user = await this.userSchema.findOne({ email: model.email });
        if (user) throw new httpException(409, `Email ${model.email} đã tồn tại`);

        const avatar = gravatar.url(model.email || '', { size: '200', rating: 'g', default: 'mm' });
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(model.password!, salt);

        const userId = new mongoose.Types.ObjectId().toString();
        const createUser: IUser = await this.userSchema.create({
            userId,
            email: model.email,
            name: model.name,
            password: hashedPassword,
            avatar: avatar,
            createdAt: Date.now(),
            xpPoints: 0,
            level: 1,
            role: "user",
        });

        return this.createToken(createUser);
    }

    public async createAdmin(model: RegisterDto): Promise<TokenData> {
        const user = await this.userSchema.findOne({ email: model.email });
        if (user) throw new httpException(409, `Email ${model.email} đã tồn tại`);

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(model.password!, salt);
        
        const createAdmin: IUser = await this.userSchema.create({
            userId: new mongoose.Types.ObjectId().toString(),
            email: model.email,
            name: model.name,
            password: hashedPassword,
            role: "admin",
            xpPoints: 0,
            level: 1
        });

        return this.createToken(createAdmin);
    }

    public async login(loginData: RegisterDto): Promise<{ token: string, user: IUser }> {
        const user = await this.userSchema.findOne({ email: loginData.email });
        if (!user) throw new httpException(409, `Email hoặc mật khẩu không đúng`);

        const isMatch = await bcryptjs.compare(loginData.password!, user.password!);
        if (!isMatch) throw new httpException(409, `Email hoặc mật khẩu không đúng`);

        const tokenData = this.createToken(user);
        return { token: tokenData.token, user };
    }

    // --- USER MANAGEMENT METHODS ---

    public async updateUser(userID: string, model: RegisterDto): Promise<IUser> {
        const user = await this.userSchema.findById(userID);
        if (!user) throw new httpException(400, `Không tìm thấy User ID`);

        const updateData: any = { name: model.name };
        if (model.password) {
            const salt = await bcryptjs.genSalt(10);
            updateData.password = await bcryptjs.hash(model.password, salt);
        }

        const updatedUser = await this.userSchema.findByIdAndUpdate(userID, updateData, { new: true }).exec();
        if (!updatedUser) throw new httpException(404, 'Update thất bại');
        return updatedUser;
    }

    public async getUserById(userId: string): Promise<IUser> {
        const user = await this.userSchema.findById(userId);
        if (!user) throw new httpException(404, `User không tồn tại`);
        return user;
    }

    public async getAllUser(): Promise<IUser[]> {
        return await this.userSchema.find();
    }

    public async getAllUserPaging(keyword: string, page: number): Promise<IPagination<IUser>> {
        const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
        const skip = (page - 1) * pageSize;
        let baseQuery = this.userSchema.find();
        if (keyword) baseQuery = baseQuery.where('name', new RegExp(keyword, 'i'));

        const [users, total] = await Promise.all([
            baseQuery.clone().sort({ createdAt: -1 }).skip(skip).limit(pageSize).exec(),
            baseQuery.countDocuments().exec()
        ]);

        return { total, page, pageSize, totalPages: Math.ceil(total / pageSize), items: users } as any;
    }

    public async deleteUser(userId: string): Promise<IUser> {
        const deleted = await this.userSchema.findByIdAndDelete(userId).exec();
        if (!deleted) throw new httpException(409, "Không tìm thấy người dùng");
        return deleted;
    }

    public async addXP(userId: string, xp: number): Promise<IUser> {
        const user = await this.userSchema.findById(userId);
        if (!user) throw new httpException(404, 'User not found');

        user.xpPoints += xp;
        // Tăng level: 100 XP cho mỗi level (có thể điều chỉnh)
        const newLevel = Math.floor(user.xpPoints / 100 + 1);
        if (newLevel > user.level) {
            user.level = newLevel;
            // Có thể thêm logic thông báo lên level ở đây
        }

        return await user.save();
    }

    public async getUserProgress(userId: string): Promise<{ xpPoints: number, level: number, xpToNextLevel: number }> {
        const user = await this.userSchema.findById(userId);
        if (!user) throw new httpException(404, 'User not found');
        return {
            xpPoints: user.xpPoints,
            level: user.level,
            xpToNextLevel: (user.level * 100) - user.xpPoints // XP cần để lên level tiếp theo
        };
    }

    // =========================================================================
    // FRIEND REQUEST METHODS với SOCKET NOTIFICATION
    // =========================================================================

    public async sendFriendRequest(senderId: string, receiverId: string): Promise<IFriendRequest> {
        // Kiểm tra xem có phải tự gửi cho mình không
        if (senderId === receiverId) {
            throw new httpException(400, "Bạn không thể gửi yêu cầu kết bạn cho chính mình");
        }

        // Tìm receiver và sender bằng userId
        const receiver = await this.userSchema.findOne({ userId: receiverId });
        const senderUser = await this.userSchema.findOne({ userId: senderId });
        
        if (!receiver || !senderUser) {
            throw new httpException(404, "Người dùng không tồn tại");
        }

        // Kiểm tra xem đã là bạn bè chưa
        if (senderUser.friends?.some(friendId => friendId.toString() === receiver.userId)) {
            throw new httpException(400, "Đã là bạn bè");
        }

        // Kiểm tra xem đã có request chưa
        const existingRequest = await this.friendRequestSchema.findOne({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                throw new httpException(400, "Đã gửi yêu cầu kết bạn trước đó");
            }
            if (existingRequest.status === 'accepted') {
                throw new httpException(400, "Đã là bạn bè");
            }
        }

        // Tạo yêu cầu kết bạn
        const friendRequest = await this.friendRequestSchema.create({
            senderId,
            receiverId,
            status: 'pending'
        });

        // Cập nhật danh sách request của người dùng
        await this.userSchema.findByIdAndUpdate(senderUser._id, {
            $addToSet: { sentRequests: receiver._id }
        });

        await this.userSchema.findByIdAndUpdate(receiver._id, {
            $addToSet: { pendingRequests: senderUser._id }
        });

        // 🔥 GỬI THÔNG BÁO SOCKET REAL-TIME
        const mutualFriends = await this.getMutualFriendsCount(senderId, receiverId);
        
        // Gửi notification qua SocketService
        SocketService.notifyFriendRequest(receiverId, {
             _id: (friendRequest._id as mongoose.Types.ObjectId).toString(),
            senderId: senderUser.userId,
            senderName: senderUser.name || 'Người dùng',
            senderAvatar: senderUser.avatar ?? null,
            mutual: mutualFriends
        });

        return friendRequest;
    }

    public async acceptFriendRequest(requestId: string, userId: string): Promise<IUser> {
        const request = await this.friendRequestSchema.findById(requestId);
        
        if (!request) {
            throw new httpException(404, "Yêu cầu kết bạn không tồn tại");
        }

        // So sánh userId
        if (request.receiverId !== userId) {
            throw new httpException(403, "Bạn không có quyền chấp nhận yêu cầu này");
        }

        if (request.status !== 'pending') {
            throw new httpException(400, "Yêu cầu kết bạn không còn hiệu lực");
        }

        // Cập nhật trạng thái request
        request.status = 'accepted';
        request.updatedAt = new Date();
        await request.save();

        // Tìm user bằng userId để lấy _id
        const receiverUser = await this.userSchema.findOne({ userId: request.receiverId });
        const senderUser = await this.userSchema.findOne({ userId: request.senderId });

        if (!receiverUser || !senderUser) {
            throw new httpException(404, "User not found");
        }

        // Thêm userId vào mảng friends
        await this.userSchema.findByIdAndUpdate(senderUser._id, {
            $addToSet: { 
                friends: request.receiverId  // Lưu userId của receiver
            },
            $pull: { 
                sentRequests: receiverUser._id  // Xóa _id của receiver
            }
        });

        await this.userSchema.findByIdAndUpdate(receiverUser._id, {
            $addToSet: { 
                friends: request.senderId  // Lưu userId của sender
            },
            $pull: { 
                pendingRequests: senderUser._id  // Xóa _id của sender
            }
        });

        // 🔥 GỬI THÔNG BÁO SOCKET: Người gửi request được biết đã được chấp nhận
        SocketService.notifyFriendRequestAccepted(request.senderId, {
            userId: receiverUser.userId,
            name: receiverUser.name || 'Người dùng',
            avatar: receiverUser.avatar ?? null
        });

        return receiverUser;
    }

    public async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
        const request = await this.friendRequestSchema.findById(requestId);
        
        if (!request) {
            throw new httpException(404, "Yêu cầu kết bạn không tồn tại");
        }

        if (request.receiverId !== userId) {
            throw new httpException(403, "Bạn không có quyền từ chối yêu cầu này");
        }

        // Cập nhật trạng thái request
        request.status = 'rejected';
        request.updatedAt = new Date();
        await request.save();

        // Tìm user để xóa khỏi danh sách pending
        const receiverUser = await this.userSchema.findOne({ userId: request.receiverId });
        const senderUser = await this.userSchema.findOne({ userId: request.senderId });

        if (receiverUser && senderUser) {
            await this.userSchema.findByIdAndUpdate(receiverUser._id, {
                $pull: { pendingRequests: senderUser._id }
            });

            await this.userSchema.findByIdAndUpdate(senderUser._id, {
                $pull: { sentRequests: receiverUser._id }
            });

            // 🔥 GỬI THÔNG BÁO SOCKET
            SocketService.notifyFriendRequestRejected(request.senderId, request.receiverId);
        }
    }

    public async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
        const request = await this.friendRequestSchema.findById(requestId);
        
        if (!request) {
            throw new httpException(404, "Yêu cầu kết bạn không tồn tại");
        }

        if (request.senderId !== userId) {
            throw new httpException(403, "Bạn không có quyền hủy yêu cầu này");
        }

        await this.friendRequestSchema.findByIdAndDelete(requestId);

        // Tìm user để xóa khỏi danh sách
        const receiverUser = await this.userSchema.findOne({ userId: request.receiverId });
        const senderUser = await this.userSchema.findOne({ userId: request.senderId });

        if (receiverUser && senderUser) {
            await this.userSchema.findByIdAndUpdate(receiverUser._id, {
                $pull: { pendingRequests: senderUser._id }
            });

            await this.userSchema.findByIdAndUpdate(senderUser._id, {
                $pull: { sentRequests: receiverUser._id }
            });

            // 🔥 GỬI THÔNG BÁO SOCKET
            SocketService.notifyFriendRequestCancelled(request.receiverId, requestId);
        }
    }

    public async removeFriend(userId: string, friendId: string): Promise<IUser | null> {
        // Kiểm tra xem có phải bạn bè không
        const user = await this.userSchema.findOne({ userId });
        if (!user?.friends?.includes(friendId)) {
            throw new httpException(400, "Người này không phải là bạn bè");
        }

        // Xóa khỏi danh sách bạn bè của cả hai
        await this.userSchema.findOneAndUpdate({ userId }, {
            $pull: { friends: friendId }
        });

        await this.userSchema.findOneAndUpdate({ userId: friendId }, {
            $pull: { friends: userId }
        });

        // Xóa hoặc cập nhật friend request tương ứng
        await this.friendRequestSchema.findOneAndDelete({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ],
            status: 'accepted'
        });

        // 🔥 GỬI THÔNG BÁO SOCKET
        SocketService.notifyFriendRemoved(friendId, userId);

        return await this.userSchema.findOne({ userId });
    }

    public async getPendingRequests(userId: string): Promise<any[]> {
        const requests = await this.friendRequestSchema.find({
            receiverId: userId,
            status: 'pending'
        }).sort({ createdAt: -1 });

        // Lấy thông tin chi tiết của người gửi
        const requestsWithDetails = await Promise.all(
            requests.map(async (req) => {
                const sender = await this.userSchema.findOne({ userId: req.senderId });
                const mutualFriends = await this.getMutualFriendsCount(userId, req.senderId);
                
                return {
                    _id: req._id,
                    senderId: req.senderId,
                    name: sender?.name || 'Người dùng',
                    avatar: sender?.avatar || null,
                    level: sender?.level || 1,
                    mutual: mutualFriends,
                    createdAt: req.createdAt
                };
            })
        );

        return requestsWithDetails;
    }

    public async getFriends(userId: string): Promise<IUser[]> {
        const user = await this.userSchema.findOne({ userId });
        
        if (!user || !user.friends || user.friends.length === 0) {
            return [];
        }
        
        const friends = await this.userSchema.find({
            userId: { $in: user.friends }
        }).select('_id userId name avatar level role');
        
        return friends;
    }

    // Helper: Đếm số bạn chung
    private async getMutualFriendsCount(userId1: string, userId2: string): Promise<number> {
        const user1 = await this.userSchema.findOne({ userId: userId1 });
        const user2 = await this.userSchema.findOne({ userId: userId2 });

        if (!user1 || !user2) return 0;

        const friends1 = user1.friends || [];
        const friends2 = user2.friends || [];

        const mutualCount = friends1.filter(f => friends2.includes(f)).length;
        return mutualCount;
    }

    private createToken(user: IUser): TokenData {
        const dataInToken: DataStoredInToken = { id: user.userId };
        const secret: string = process.env.JWT_TOKEN_SECRET!;
        const expiresIn: number = 259200;
        return { token: jwt.sign(dataInToken, secret, { expiresIn }) };
    }
}

export default UserService;