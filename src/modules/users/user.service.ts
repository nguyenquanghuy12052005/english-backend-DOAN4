 
 import { email } from 'envalid';
import { httpException } from '../../core/exceptions';
import { isEmptyObj } from '../../core/utils';
import { DataStoredInToken, TokenData } from '../auth';
import RegisterDto from './dtos/register.dtos';
import UserSchema from './user.model';
import  FriendRequestSchema  from './friendRequest.model';
import gravatar from 'gravatar';
import bcryptjs from 'bcryptjs';
// import IUser from './user.interface';
import { IFriendRequest, IUser } from './user.interface';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IPagination } from '../../core/interface';
 class UserService {
    public userSchema = UserSchema;
    public friendRequestSchema = FriendRequestSchema;

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


//thêm  điểm kinh nghiệm (XP)
public async addXP(userId: string, xp: number) : Promise<IUser> {
    const user = await this.userSchema.findById(userId);

     if (!user) throw new httpException(404, 'User not found');

      // Thêm XP
      user.xpPoints += xp;

      //tăng level
      const newLevel = Math.floor(user.xpPoints / 10 + 1);
      if(newLevel > user.level ) {
        user.level = newLevel;
        // thêm logic thông báo lên level (làm sau)*****************
      }

      return await user.save();
}

//theo dõi trang thái level, điểm
public async getUserProgress(userId: string ) :Promise<{xpPoints: number, level: number, xpToNextLevel: number}> {

     const user = await this.userSchema.findById(userId);
     if (!user) throw new httpException(404, 'User not found');


       return {
      xpPoints: user.xpPoints,
      level: user.level,
      xpToNextLevel: (user.level * 10) - user.xpPoints // XP cần để lên level tiếp theo
    };
}

// Gửi yêu cầu kết bạn
 public async sendFriendRequest(senderId: string, receiverId: string): Promise<IFriendRequest> {
    // Kiểm tra xem có phải tự gửi cho mình không
    if (senderId === receiverId) {
        throw new httpException(400, "Bạn không thể gửi yêu cầu kết bạn cho chính mình");
    }

    // Tìm receiver bằng userId (vì receiverId từ body là userId)
    const receiver = await this.userSchema.findOne({ userId: receiverId });
    if (!receiver) {
        throw new httpException(404, "Người dùng không tồn tại");
    }

    // Tìm sender bằng userId (vì senderId từ token là userId)
    const senderUser = await this.userSchema.findOne({ userId: senderId });
    if (!senderUser) {
        throw new httpException(404, "Sender not found");
    }

    // Kiểm tra xem đã là bạn bè chưa
if (senderUser?.friends?.some(friendId => friendId.toString() === receiver._id?.toString())) {
    throw new httpException(400, "Đã là bạn bè");
}

    // Kiểm tra xem đã có request chưa
    const existingRequest = await this.friendRequestSchema.findOne({
        $or: [
            { senderId: senderId, receiverId: receiverId }, //
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

    // ⭐ Lưu userId vào FriendRequest
    const friendRequest = await this.friendRequestSchema.create({
        senderId: senderId,      // userId của người gửi
        receiverId: receiverId,  // userId của người nhận
        status: 'pending'
    });

    // Cập nhật danh sách request của người dùng (dùng _id để update)
    await this.userSchema.findByIdAndUpdate(senderUser._id, {
        $addToSet: { sentRequests: receiver._id }
    });

    await this.userSchema.findByIdAndUpdate(receiver._id, {
        $addToSet: { pendingRequests: senderUser._id }
    });

    return friendRequest;
}

  // Chấp nhận yêu cầu kết bạn
public async acceptFriendRequest(requestId: string, userId: string): Promise<IUser> {
    const request = await this.friendRequestSchema.findById(requestId);
    
    if (!request) {
        throw new httpException(404, "Yêu cầu kết bạn không tồn tại");
    }

    // So sánh userId với userId
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

    // ⭐ TÌM USER BẰNG userId ĐỂ LẤY _id
    const receiverUser = await this.userSchema.findOne({ userId: request.receiverId });
    const senderUser = await this.userSchema.findOne({ userId: request.senderId });

    if (!receiverUser || !senderUser) {
        throw new httpException(404, "User not found");
    }

    // ⭐ THÊM userId VÀO MẢNG FRIENDS
    await this.userSchema.findByIdAndUpdate(senderUser._id, {
        $addToSet: { 
            friends: request.receiverId  // ⭐ Lưu userId của receiver
        },
        $pull: { 
            sentRequests: receiverUser._id  // ⭐ Xóa _id của receiver
        }
    });

    await this.userSchema.findByIdAndUpdate(receiverUser._id, {
        $addToSet: { 
            friends: request.senderId  // ⭐ Lưu userId của sender
        },
        $pull: { 
            pendingRequests: senderUser._id  // ⭐ Xóa _id của sender
        }
    });

    return receiverUser;
}

  // Từ chối yêu cầu kết bạn
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

    // Xóa khỏi danh sách pending
    await this.userSchema.findByIdAndUpdate(request.receiverId, {
      $pull: { pendingRequests: request.senderId }
    });

    await this.userSchema.findByIdAndUpdate(request.senderId, {
      $pull: { sentRequests: request.receiverId }
    });
  }

  // Hủy yêu cầu kết bạn
  public async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
    const request = await this.friendRequestSchema.findById(requestId);
    
    if (!request) {
      throw new httpException(404, "Yêu cầu kết bạn không tồn tại");
    }

    if (request.senderId !== userId) {
      throw new httpException(403, "Bạn không có quyền hủy yêu cầu này");
    }

    await this.friendRequestSchema.findByIdAndDelete(requestId);

    // Xóa khỏi danh sách pending
    await this.userSchema.findByIdAndUpdate(request.receiverId, {
      $pull: { pendingRequests: request.senderId }
    });

    await this.userSchema.findByIdAndUpdate(request.senderId, {
      $pull: { sentRequests: request.receiverId }
    });
  }

  // Xóa bạn bè
  public async removeFriend(userId: string, friendId: string): Promise<IUser | null> {
    // Kiểm tra xem có phải bạn bè không
    const user = await this.userSchema.findById(userId);
    if (!user?.friends?.includes(friendId)) {
      throw new httpException(400, "Người này không phải là bạn bè");
    }

    // Xóa khỏi danh sách bạn bè của cả hai
    await this.userSchema.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await this.userSchema.findByIdAndUpdate(friendId, {
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

    return await this.userSchema.findById(userId);
  }

  // Lấy danh sách yêu cầu kết bạn đang chờ
  public async getPendingRequests(userId: string): Promise<IFriendRequest[]> {
      const user = await this.userSchema.findById(userId);
    return await this.friendRequestSchema.find({
      receiverId: userId,
      status: 'pending'
    }).sort({ createdAt: -1 });
  }

  // Lấy danh sách bạn bè
public async getFriends(userId: string): Promise<IUser[]> {
    
    const user = await this.userSchema.findOne({ userId: userId });
    
    if (!user || !user.friends || user.friends.length === 0) {
        return [];
    }
    
   
    const friends = await this.userSchema.find({
        userId: { $in: user.friends } 
    }).select('_id userId name avatar');
    
    return friends;
}


private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = {id: user.userId};
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expiresIn: number = 259200;
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