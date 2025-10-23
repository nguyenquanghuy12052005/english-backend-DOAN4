 
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

    public async createUser( model: RegisterDto) : Promise<TokenData> {  
        
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


        const userId = new mongoose.Types.ObjectId().toString(); //tạo userID ngẫu nhiên
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


 public async updateUser(userID: string, model: RegisterDto) : Promise<IUser> {  
        
        //kiểm tra rỗng
        if(isEmptyObj(model)){
            throw new httpException(400,'lỗi đăng ký rỗng rồi cu');
        }

        //kiểm tra user tồn tại chưa
        const user = await this.userSchema.findById(userID);
        if(!user) {
            throw new httpException(400, `không có user id cu`)
        }

        //kiểm tra trùng email
           if (model.email && model.email !== user.email) {
               const existingUser = await this.userSchema.findOne({ email: model.email }); //kiểm tra email mới có trùng với email nào trng db không

            if(existingUser) {
            throw new httpException(409, `Email ${model.email} đã tồn tại rồi cu`);
        }
           } 

        let updateUserById;

    const updateData: any = {
           name: model.name, 
    };


    let avatar = user.avatar;
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


            //Tạo avatar mặc định dựa theo email
      

        if (model.avatar) {
        updateData.avatar = model.avatar;
    }

 


        if(model.password) {
            const salt = await bcryptjs.genSalt(10);
            const  hashedPassword = await bcryptjs.hash(model.password, salt);
            updateData.password = hashedPassword;  
        }

       // Thực hiện update
    updateUserById = await this.userSchema.findByIdAndUpdate(
        userID, 
        updateData,
        { new: true } 
    ).exec();

       if(!updateUserById) throw new httpException(404, 'cu không phải user');  

       return updateUserById;
    }


  public async getUserById(userId: string) : Promise<IUser> {  

        //kiểm tra email tồn tại chưa
        // const user = await  this.userSchema.findOne(userId: userId);
        //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
        //  const user = await this.userSchema.findOne({ userId: userId });
         const user = await this.userSchema.findById(userId);

        if( !user) {
            throw new httpException(404, `user không tồn tại nha cu`)
        }
       
        return user;
    
    }

  public async getAllUser() : Promise<IUser[]> {  

        //kiểm tra email tồn tại chưa
        // const user = await  this.userSchema.findOne(userId: userId);
        //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
         const users = await this.userSchema.find();
    
        return users;
    
    }


       
//   public async getAllUserPaging(keyword: string, page: number): Promise<IPagination<IUser>> {
//     const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
//     const skip = (page - 1) * pageSize;

//     // Tạo query cơ bản MỘT LẦN
//     let baseQuery = this.userSchema.find();

//     if (keyword) {
//         baseQuery = baseQuery.where('name', new RegExp(keyword, 'i'));  //không phân biệt hoa thượngf
//     }

//     // Dùng baseQuery cho cả hai mục đích
//     const [users, total] = await Promise.all([
//         baseQuery.clone().sort({ date: -1 }).skip(skip).limit(pageSize).exec(), //Lấy danh sách user
//         baseQuery.countDocuments().exec() //Đếm tổng số kết quả
//     ]);

//     return {
//         total: total,
//         page: page,
//         pageSize: pageSize,
//         totalPages: Math.ceil(total / pageSize),
//         items: users
//     } as unknown as IPagination<IUser>;
// }


public async getAllUserPaging(keyword: string, page: number): Promise<IPagination<IUser>> {
    const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
    const skip = (page - 1) * pageSize;

   // console.log(` SEARCH: keyword="${keyword}", page=${page}, pageSize=${pageSize}, skip=${skip}`);

    let baseQuery = this.userSchema.find();

    if (keyword) {
        baseQuery = baseQuery.where('name', new RegExp(keyword, 'i'));
     //   console.log(`Applied filter: name contains "${keyword}"`);
    }

    const [users, total] = await Promise.all([
        baseQuery.clone()
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(pageSize)
            .exec(),
        baseQuery.countDocuments().exec()
    ]);

   // console.log(`RESULTS: total=${total}, found=${users.length} users`);
  //  console.log(` Users found:`, users.map(user => ({ name: user.name, email: user.email })));

    return {
        total: total,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
        items: users
    } as unknown as IPagination<IUser>;
}


public async deleteUser(userId: string) : Promise<IUser>{

    const deleteUser = await this.userSchema.findByIdAndDelete(userId).exec();
    if(!deleteUser) {
        throw new httpException(409, "không tìm thấy người dùng")
    }
    return deleteUser;
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