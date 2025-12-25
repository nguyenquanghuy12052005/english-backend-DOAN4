import { email } from 'envalid';
import { httpException } from '../../core/exceptions';
import { isEmptyObj } from '../../core/utils';
import { DataStoredInToken, TokenData } from '../auth';
import RegisterDto from './dtos/register.dtos';
import UserSchema from './user.model';
import gravatar from 'gravatar';
import bcryptjs from 'bcryptjs';
// import IUser from './user.interface';
import { IUser } from './user.interface';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IPagination } from '../../core/interface';

class UserService {
    public userSchema = UserSchema;

    public async createUser(model: RegisterDto): Promise<TokenData> {
        // 1. Kiểm tra rỗng
        if (isEmptyObj(model)) {
            throw new httpException(400, 'Lỗi: Dữ liệu đăng ký rỗng');
        }

        // 2. Kiểm tra password và email bắt buộc phải có
        if (!model.email || !model.password) {
            throw new httpException(400, 'Vui lòng nhập đầy đủ Email và Mật khẩu');
        }

        // 3. Kiểm tra email tồn tại chưa
        const user = await this.userSchema.findOne({ email: model.email });
        if (user) {
            throw new httpException(409, `Email ${model.email} đã tồn tại`)
        }

        const avatar = gravatar.url(model.email, {
            size: '200',
            rating: 'g',
            default: 'mm'
        });

        const salt = await bcryptjs.genSalt(10);
        // Fix TS: model.password!
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

    // =========================================================================
    // PHẦN MỚI THÊM: CREATE ADMIN
    // =========================================================================
    public async createAdmin(model: RegisterDto): Promise<TokenData> {
        if (isEmptyObj(model)) throw new httpException(400, 'Dữ liệu rỗng');

        if (!model.email || !model.password) {
            throw new httpException(400, 'Vui lòng nhập đầy đủ Email và Mật khẩu');
        }

        const user = await this.userSchema.findOne({ email: model.email });
        if (user) throw new httpException(409, `Email ${model.email} đã tồn tại`);

        const avatar = gravatar.url(model.email, { size: '200', rating: 'g', default: 'mm' });
        const salt = await bcryptjs.genSalt(10);
        
        // Fix TS: model.password!
        const hashedPassword = await bcryptjs.hash(model.password!, salt);
        
        const userId = new mongoose.Types.ObjectId().toString();

        const createAdmin: IUser = await this.userSchema.create({
            userId,
            email: model.email,
            name: model.name,
            password: hashedPassword,
            avatar: avatar,
            createdAt: Date.now(),
            xpPoints: 0,
            level: 1,
            role: "admin", 
        });

        return this.createToken(createAdmin);
    }

    // =========================================================================
    // PHẦN MỚI THÊM: LOGIN
    // =========================================================================
    public async login(loginData: RegisterDto): Promise<{ token: string, user: IUser }> {
        if (isEmptyObj(loginData)) throw new httpException(400, 'Chưa nhập dữ liệu');

        if (!loginData.email || !loginData.password) {
            throw new httpException(400, 'Vui lòng nhập đầy đủ Email và Mật khẩu');
        }

        const user = await this.userSchema.findOne({ email: loginData.email });
        if (!user) throw new httpException(409, `Email hoặc mật khẩu không đúng`);

        // =================================================================
        // FIX LỖI TẠI ĐÂY: Thêm dấu ! vào CẢ HAI BIẾN
        // loginData.password!  VÀ  user.password!
        // =================================================================
        const isMatch = await bcryptjs.compare(loginData.password!, user.password!);
        
        if (!isMatch) throw new httpException(409, `Email hoặc mật khẩu không đúng`);

        const tokenData = this.createToken(user);
        
        return { token: tokenData.token, user };
    }
    // =========================================================================


    public async updateUser(userID: string, model: RegisterDto): Promise<IUser> {
        if (isEmptyObj(model)) {
            throw new httpException(400, 'Dữ liệu update rỗng');
        }

        const user = await this.userSchema.findById(userID);
        if (!user) {
            throw new httpException(400, `Không tìm thấy User ID`)
        }

        if (model.email && model.email !== user.email) {
            const existingUser = await this.userSchema.findOne({ email: model.email });
            if (existingUser) {
                throw new httpException(409, `Email ${model.email} đã tồn tại`);
            }
        }

        let updateUserById;

        const updateData: any = {
            name: model.name,
        };

        if (model.email && model.email !== user.email) {
            updateData.email = model.email;

            if (!model.avatar) {
                const newAvatar = gravatar.url(model.email, {
                    size: '200',
                    rating: 'g',
                    default: 'mm'
                });
                updateData.avatar = newAvatar;
            }
        }
        
        if (model.avatar) {
            updateData.avatar = model.avatar;
        }

        if (model.password) {
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(model.password, salt);
            updateData.password = hashedPassword;
        }

        updateUserById = await this.userSchema.findByIdAndUpdate(
            userID,
            updateData,
            { new: true }
        ).exec();

        if (!updateUserById) throw new httpException(404, 'Update thất bại');

        return updateUserById;
    }


    public async getUserById(userId: string): Promise<IUser> {
        const user = await this.userSchema.findById(userId);
        if (!user) {
            throw new httpException(404, `User không tồn tại`)
        }
        return user;
    }

    public async getAllUser(): Promise<IUser[]> {
        const users = await this.userSchema.find();
        return users;
    }


    public async getAllUserPaging(keyword: string, page: number): Promise<IPagination<IUser>> {
        const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
        const skip = (page - 1) * pageSize;

        let baseQuery = this.userSchema.find();

        if (keyword) {
            baseQuery = baseQuery.where('name', new RegExp(keyword, 'i'));
        }

        const [users, total] = await Promise.all([
            baseQuery.clone()
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(pageSize)
                .exec(),
            baseQuery.countDocuments().exec()
        ]);

        return {
            total: total,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(total / pageSize),
            items: users
        } as unknown as IPagination<IUser>;
    }


    public async deleteUser(userId: string): Promise<IUser> {
        const deleteUser = await this.userSchema.findByIdAndDelete(userId).exec();
        if (!deleteUser) {
            throw new httpException(409, "Không tìm thấy người dùng để xóa")
        }
        return deleteUser;
    }


    public async addXP(userId: string, xp: number): Promise<IUser> {
        const user = await this.userSchema.findById(userId);

        if (!user) throw new httpException(404, 'User not found');

        user.xpPoints += xp;

        const newLevel = Math.floor(user.xpPoints / 100 + 1);
        if (newLevel > user.level) {
            user.level = newLevel;
        }

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

    private createToken(user: IUser): TokenData {
        const dataInToken: DataStoredInToken = { id: user.userId };
        const secret: string = process.env.JWT_TOKEN_SECRET!;
        const expiresIn: number = 86400; // 24h
        return {
            token: jwt.sign(dataInToken, secret, { expiresIn: expiresIn }),
        }
    }
}
export default UserService;