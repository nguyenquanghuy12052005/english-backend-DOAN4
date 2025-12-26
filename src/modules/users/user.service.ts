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
        const newLevel = Math.floor(user.xpPoints / 100 + 1);
        if (newLevel > user.level) user.level = newLevel;

        return await user.save();
    }

    public async getUserProgress(userId: string): Promise<{ xpPoints: number, level: number, xpToNextLevel: number }> {
        const user = await this.userSchema.findById(userId);
        if (!user) throw new httpException(404, 'User not found');
        return {
            xpPoints: user.xpPoints,
            level: user.level,
            xpToNextLevel: (user.level * 100) - user.xpPoints
        };
    }

    // --- FRIEND REQUEST METHODS ---

    public async sendFriendRequest(senderId: string, receiverId: string): Promise<IFriendRequest> {
        if (senderId === receiverId) throw new httpException(400, "Không thể tự kết bạn");

        const receiver = await this.userSchema.findOne({ userId: receiverId });
        const sender = await this.userSchema.findOne({ userId: senderId });
        if (!receiver || !sender) throw new httpException(404, "User không tồn tại");

        const existingRequest = await this.friendRequestSchema.findOne({
            $or: [{ senderId, receiverId }, { senderId: receiverId, receiverId: senderId }]
        });
        if (existingRequest) throw new httpException(400, "Yêu cầu đã tồn tại hoặc đã là bạn");

        const request = await this.friendRequestSchema.create({ senderId, receiverId, status: 'pending' });
        
        await this.userSchema.findByIdAndUpdate(sender._id, { $addToSet: { sentRequests: receiver._id } });
        await this.userSchema.findByIdAndUpdate(receiver._id, { $addToSet: { pendingRequests: sender._id } });

        return request;
    }

    public async acceptFriendRequest(requestId: string, userId: string): Promise<IUser> {
        const request = await this.friendRequestSchema.findById(requestId);
        if (!request || request.status !== 'pending') throw new httpException(400, "Yêu cầu không hợp lệ");
        if (request.receiverId !== userId) throw new httpException(403, "Không có quyền");

        request.status = 'accepted';
        await request.save();

        const receiver = await this.userSchema.findOne({ userId: request.receiverId });
        const sender = await this.userSchema.findOne({ userId: request.senderId });

        if (receiver && sender) {
            await this.userSchema.findByIdAndUpdate(sender._id, {
                $addToSet: { friends: request.receiverId },
                $pull: { sentRequests: receiver._id }
            });
            await this.userSchema.findByIdAndUpdate(receiver._id, {
                $addToSet: { friends: request.senderId },
                $pull: { pendingRequests: sender._id }
            });
        }
        return receiver!;
    }

    public async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
        const request = await this.friendRequestSchema.findById(requestId);
        if (!request || request.receiverId !== userId) throw new httpException(403, "Không có quyền");
        
        request.status = 'rejected';
        await request.save();
    }

    public async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
        const request = await this.friendRequestSchema.findById(requestId);
        if (!request) throw new httpException(404, "Không tìm thấy yêu cầu");
        if (request.senderId !== userId) throw new httpException(403, "Không có quyền hủy");

        await this.friendRequestSchema.findByIdAndDelete(requestId);

        const receiver = await this.userSchema.findOne({ userId: request.receiverId });
        const sender = await this.userSchema.findOne({ userId: request.senderId });

        if (receiver && sender) {
            await this.userSchema.findByIdAndUpdate(receiver._id, { $pull: { pendingRequests: sender._id } });
            await this.userSchema.findByIdAndUpdate(sender._id, { $pull: { sentRequests: receiver._id } });
        }
    }

    public async removeFriend(userId: string, friendId: string): Promise<IUser | null> {
        await this.userSchema.findOneAndUpdate({ userId }, { $pull: { friends: friendId } });
        await this.userSchema.findOneAndUpdate({ userId: friendId }, { $pull: { friends: userId } });
        return await this.userSchema.findOne({ userId });
    }

    public async getPendingRequests(userId: string): Promise<IFriendRequest[]> {
        return await this.friendRequestSchema.find({ receiverId: userId, status: 'pending' });
    }

    public async getFriends(userId: string): Promise<IUser[]> {
        const user = await this.userSchema.findOne({ userId });
        if (!user || !user.friends) return [];
        return await this.userSchema.find({ userId: { $in: user.friends } }).select('userId name avatar');
    }

    private createToken(user: IUser): TokenData {
        const dataInToken: DataStoredInToken = { id: user.userId };
        const secret: string = process.env.JWT_TOKEN_SECRET!;
        const expiresIn: number = 259200;
        return { token: jwt.sign(dataInToken, secret, { expiresIn }) };
    }
}

export default UserService;