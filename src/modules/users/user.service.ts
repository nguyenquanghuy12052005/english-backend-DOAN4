 
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
 class UserService {
    public userSchema = UserSchema;

    public async createUser(model: RegisterDto) : Promise<TokenData> {  
        
        //kiểm tra rỗng
        if(isEmptyObj(model)){
            throw new httpException(400,'lỗi đăng ký rỗng rồi cu');
        }

        //kiểm tra email tồn tại chưa
        const user = await  this.userSchema.findOne({email: model.email});
        if( user) {
            throw new httpException(409, `email của cu đã tồn tại ${model.email}`)
        }

        //Tạo avatar mặc định dựa theo email
        const avatar = gravatar.url(model.email!, {
            size: '200',
            rating: 'g',
            default: 'mm'
        });

          //Mã hoá mật khẩu
        const salt = await bcryptjs.genSalt(10);
        const  hashedPassword = await bcryptjs.hash(model.password!, salt);


        const userId = new mongoose.Types.ObjectId().toString();
         //Tạo user trong MongoDB
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

        //rả về token đăng nhập luôn
        return this.createToken(createUser);
    }

private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = {id: user.userId};
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expiresIn: number = 60;
    return {
         token: jwt.sign(dataInToken,secret, {expiresIn:expiresIn}),
    }
}


// private createToken(user: IUser): TokenData {
//     try {
//         console.log('Creating token for user:', user.userId);
        
//         // ✅ FIX 1: Kiểm tra JWT secret
//         const secret = process.env.JWT_TOKEN_SECRET;
//         if (!secret) {
//             console.error('JWT_TOKEN_SECRET is not defined in environment variables');
//             throw new httpException(500, 'Server configuration error');
//         }

//         const dataInToken: DataStoredInToken = { id: user.userId };
        
//         // ✅ FIX 2: Thời gian hết hạn hợp lý (60 giây = 60, 1 giờ = 3600)
//         const expiresIn: number = 60 * 60; // 1 giờ
        
//         console.log('JWT Secret exists:', !!secret);
//         console.log('Expires in:', expiresIn);
        
//         const token = jwt.sign(dataInToken, secret, { expiresIn });
//         console.log('Token created successfully');
        
//         // ✅ FIX 3: Trả về đúng structure
//         return {
//             token: token,
//             expiresIn: expiresIn // Thêm field này
//         };
        
//     } catch (error) {
//         console.error('Token creation error:', error);
//         throw new httpException(500, 'Failed to create authentication token');
//     }
// }

 }
 export default UserService;    