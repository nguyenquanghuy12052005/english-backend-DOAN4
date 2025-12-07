  

import { httpException } from '../../core/exceptions';
import { isEmptyObj } from '../../core/utils';
import { DataStoredInToken, IUser, TokenData } from '../auth';

import bcryptjs from 'bcryptjs';

import jwt from 'jsonwebtoken';

import LoginDto from './auth.dto';
import { UserSchema } from '../users';
 class AuthService {
    public userSchema = UserSchema;

    public async login(model: LoginDto) : Promise<TokenData> {  
        
        //kiểm tra rỗng
        if(isEmptyObj(model)){
            throw new httpException(400,'lỗi đăng ký rỗng rồi cu');
        }

        //kiểm tra email tồn tại chưa
        const user = await  this.userSchema.findOne({email: model.email});
        if( !user) {
            throw new httpException(409, `sai mail rồi cu (hông có mail nha) ${model.email}`)
        }

    const isMatchPassword = await bcryptjs.compare(model.password, user.password!);
    if(!isMatchPassword) throw new httpException(400,"login sai rồi cu");

        //rả về token đăng nhập luôn
        return this.createToken(user);
    }


     public async getCurrentLoginUser(userId: string) : Promise<IUser> {  

        //kiểm tra email tồn tại chưa
        // const user = await  this.userSchema.findOne(userId: userId);
        //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
         const user = await this.userSchema.findOne({ userId: userId });
        if( !user) {
            throw new httpException(404, `user không tồn tại nha cu`)
        }
       
        return user;
    
    }

    
    //  public async getAllUser() : Promise<IUser[]> {  

    //     //kiểm tra email tồn tại chưa
    //     // const user = await  this.userSchema.findOne(userId: userId);
    //     //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
    //      const users = await this.userSchema.find();
    
    //     return users;
    
    // }


       
    //  public async getAllUserPaging() : Promise<IUser[]> {  

    //     //kiểm tra email tồn tại chưa
    //     // const user = await  this.userSchema.findOne(userId: userId);
    //     //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
    //      const users = await this.userSchema.find();
    
    //     return users;
    
    // }


private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = {id: user.userId};
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expiresIn: number = 259200;
    return {
         token: jwt.sign(dataInToken,secret, {expiresIn:expiresIn}),
    }
}




 }
 export default AuthService;    