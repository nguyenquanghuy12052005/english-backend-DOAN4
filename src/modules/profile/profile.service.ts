// import { normalize } from "path";
// import { httpException } from "../../core/exceptions";
// import { IUser } from "../auth";
// import { UserSchema } from "../users";
// import { IProfile, ISocial, IEducation } from "./profile.interface";
// import ProfileSchema from './profile.model'
// import { CreateProfileDto } from "./dtos/create_profile.dto"; 

// class ProfileService { 
//     public async getCurrentProfile(userId: string): Promise<Partial<any>> {
//         const user = await ProfileSchema.findOne({ user: userId })
//             .populate('user', ['name', 'avatar']) 
//             .exec();
        
//         if (!user) {
//             throw new httpException(400, 'không có profile của user');
//         }
        
//         return user;
//     }

//     public async createProfile(userId: string, profileDto: CreateProfileDto): Promise<IProfile> {
//         const {
//             location,
//             phone,
//             status,
//             education,
//             social,
//             date
//         } = profileDto;

 
//         const { facebook, youtube, tiktok, instagram } = social || {};

//         const profileFields: Partial<IProfile> = {
//             user: userId,
//             location,
//             phone,
//             status,
//            education: education.map(edu => ({
             
//                 school: edu.school,
//                 degree: edu.degree,
//                 fieldofstudy: edu.fieldofstudy,
//                 from: edu.from,
//                 to: edu.to,
//                 current: edu.current,
//                 description: edu.description
//             })),
//             date
//         };

//         const socialFields: ISocial = {
//             facebook: facebook || '',
//             youtube: youtube || '',
//             tiktok: tiktok || '',
//             instagram: instagram || ''
//         };

//         // Normalize social URLs
//         for (const [key, value] of Object.entries(socialFields)) {
//             if (value && value.length > 0) { // Sửa 'lenght' thành 'length'
//                 socialFields[key as keyof ISocial] = normalize(value, { forceHttps: true });
//             }
//         }

//         profileFields.social = socialFields;

//         const profile = await ProfileSchema.findOneAndUpdate(
//             { user: userId },
//             { $set: profileFields },
//             { new: true, upsert: true, setDefaultsOnInsert: true }
//         ).exec();

//         return profile as IProfile;
//     }
// }

// export default ProfileService;