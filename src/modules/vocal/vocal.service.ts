 
import { email } from 'envalid';
import { httpException } from '../../core/exceptions';
import { isEmptyObj } from '../../core/utils';
import { DataStoredInToken, TokenData } from '../auth';
import CreateVocalDto from './dtos/create_vocal.dtos';
import VocalSchema from './vocal.model';
import gravatar from 'gravatar';
import bcryptjs from 'bcryptjs';
// import IUser from './user.interface';
import { IVocal } from './vocal.interface';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IPagination } from '../../core/interface';
 class VocalService {
    public vocalSchema = VocalSchema;

    public async createVocal(vocalDto: CreateVocalDto) : Promise<IVocal> {
        
        // Kiểm tra từ đã tồn tại chưa
        const existingVocal = await this.vocalSchema.findOne({ 
            word: vocalDto.word 
        }).exec(); 

        if (existingVocal) {
            throw new httpException(400, "Từ vựng đã tồn tại");
        }

        
     const newVocal = new VocalSchema({
            word: vocalDto.word,
            phonetic: vocalDto.phonetic || [],
            image: vocalDto.image,
            meanings: vocalDto.meanings || [],
            voice: vocalDto.voice,
            level: vocalDto.level,
            user_learned: vocalDto.user_learned || []
        });
        const vocal = await newVocal.save();
        return vocal;
       }
   


public async updateVoc(vocId: string, vocalDto: CreateVocalDto): Promise<IVocal> {

  if (!mongoose.isValidObjectId(vocId)) {
    throw new httpException(400, "ID không hợp lệ");
  }

  const updateVoc = await VocalSchema.findByIdAndUpdate(
    vocId, { $set: vocalDto },   {   new: true,  runValidators: true,  }
  ).exec();

  if (!updateVoc) {
    throw new httpException(404, "Không tìm thấy từ vựng để update");
  }

  return updateVoc;
}



  public async getVocById(vocId: string) : Promise<IVocal> {  

        //kiểm tra email tồn tại chưa
        // const user = await  this.userSchema.findOne(userId: userId);
        //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
        //  const user = await this.userSchema.findOne({ userId: userId });
         const voc = await this.vocalSchema.findById(vocId);

        if( !voc) {
            throw new httpException(404, `voc không tồn tại nha cu`)
        }
       
        return voc;
    
    }

  public async getAllVoc() : Promise<IVocal[]> {  

        //kiểm tra email tồn tại chưa
        // const user = await  this.userSchema.findOne(userId: userId);
        //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
         const voc = await this.vocalSchema.find();
    
        return voc;
    
    }





// public async getAllUserPaging(keyword: string, page: number): Promise<IPagination<IUser>> {
//     const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
//     const skip = (page - 1) * pageSize;

//    // console.log(` SEARCH: keyword="${keyword}", page=${page}, pageSize=${pageSize}, skip=${skip}`);

//     let baseQuery = this.userSchema.find();

//     if (keyword) {
//         baseQuery = baseQuery.where('name', new RegExp(keyword, 'i'));
//      //   console.log(`Applied filter: name contains "${keyword}"`);
//     }

//     const [users, total] = await Promise.all([
//         baseQuery.clone()
//             .sort({ createdAt: -1, _id: -1 })
//             .skip(skip)
//             .limit(pageSize)
//             .exec(),
//         baseQuery.countDocuments().exec()
//     ]);

//    // console.log(`RESULTS: total=${total}, found=${users.length} users`);
//   //  console.log(` Users found:`, users.map(user => ({ name: user.name, email: user.email })));

//     return {
//         total: total,
//         page: page,
//         pageSize: pageSize,
//         totalPages: Math.ceil(total / pageSize),
//         items: users
//     } as unknown as IPagination<IUser>;
// }


public async deleteVoc(vocId: string) : Promise<IVocal>{

    const deleteUser = await this.vocalSchema.findByIdAndDelete(vocId).exec();
    if(!deleteUser) {
        throw new httpException(409, "không tìm thấyvoc")
    }
    return deleteUser;
}


// //thêm  điểm kinh nghiệm (XP)
// public async addXP(userId: string, xp: number) : Promise<IUser> {
//     const user = await this.userSchema.findById(userId);

//      if (!user) throw new httpException(404, 'User not found');

//       // Thêm XP
//       user.xpPoints += xp;

//       //tăng level
//       const newLevel = Math.floor(user.xpPoints / 100 + 1);
//       if(newLevel > user.level ) {
//         user.level = newLevel;
//         // thêm logic thông báo lên level (làm sau)*****************
//       }

//       return await user.save();
// }

// //theo dõi trang thái level, điểm
// public async getUserProgress(userId: string ) :Promise<{xpPoints: number, level: number, xpToNextLevel: number}> {

//      const user = await this.userSchema.findById(userId);
//      if (!user) throw new httpException(404, 'User not found');


//        return {
//       xpPoints: user.xpPoints,
//       level: user.level,
//       xpToNextLevel: (user.level * 100) - user.xpPoints // XP cần để lên level tiếp theo
//     };
// }





// private createToken(user: IUser): TokenData {
//     const dataInToken: DataStoredInToken = {id: user.userId};
//     const secret: string = process.env.JWT_TOKEN_SECRET!;
//     const expiresIn: number = 120;
//     return {
//          token: jwt.sign(dataInToken,secret, {expiresIn:expiresIn}),
//     }
// }



 }
 export default VocalService;    