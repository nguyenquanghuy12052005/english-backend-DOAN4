
import { httpException } from "../../core/exceptions";
import { UserSchema } from "../users";
import { IChat, IMessages } from "./chat.interface";
import SendMessageDto from "./dtos/send.message.dto";
import ChatSchema from "./chat.model"

export default class ChatService {
    public async sendMessage(userId: string, dto: SendMessageDto): Promise<IChat> {
        const user = await UserSchema.findOne({ userId: userId }).select('-password').exec();
        if (!user) throw new httpException(400, "Không có user");

        const toUser = await UserSchema.findOne({ userId: dto.to }).select('-password').exec();
        if (!toUser) throw new httpException(400, "Không có user để gửi");

        // Kiểm tra không cho gửi tin nhắn cho chính mình
        if (userId === dto.to) throw new httpException(400, "Không thể gửi tin nhắn cho chính mình");

        // Tìm chat đã tồn tại giữa 2 user
        const existingChat = await ChatSchema.findOne({
            $or: [
                { user1: userId, user2: dto.to },
                { user1: dto.to, user2: userId }
            ]
        }).exec();

        if (existingChat) {
            // Nếu đã có chat -> thêm tin nhắn mới
            existingChat.messages.unshift({
                to: dto.to,
                from: userId,
                text: dto.text,
                read: false,
                date: new Date(),
                show_on_from: true,
                show_on_to: true
            } as IMessages);

            // Cập nhật thời gian gần nhất
            existingChat.recent_date = new Date();
            await existingChat.save();
            return existingChat;
        } else {
            // Nếu chưa có chat -> tạo chat mới
            const newChat = new ChatSchema({
                user1: userId,
                user2: dto.to,
                messages: [{
                    from: userId,
                    to: dto.to,
                    text: dto.text,
                    read: false,
                    date: new Date(),
                    show_on_from: true,
                    show_on_to: true
                }]
            });
            await newChat.save();
            return newChat;
        }
    }
}



























// import { httpException } from "../../core/exceptions";
// import { UserSchema } from "../users";
// import { IChat, IMessages } from "./chat.interface";
// import SendMessageDto from "./dtos/send.message.dto";
// import ChatSchema from "./chat.model"

// export default class ChatService  {
//     public async sendMessage (userId: string, dto:SendMessageDto) : Promise<IChat> {
//         const user = await UserSchema.findOne({userId: userId}).select('-password').exec();
//           if(!user) throw new httpException(400, " không có user")

//             const toUser = await UserSchema.findOne({userId: dto.to}).select('-password').exec();
//               if(!toUser) throw new httpException(400, " không có user để gửi")


//                 // Kiểm tra không cho gửi tin nhắn cho chính mình
//                 if (userId === dto.to)  throw new httpException(400, "Không thể gửi tin nhắn cho chính mình");
   
//               const chat = await ChatSchema.findOne({$or: [{ user1: userId, user2: dto.to },{ user1: dto.to, user2: userId }
//               ]
//               }).exec();

//               if(chat.length > 0){
//                 chat[0].messages.unshift({
//                 to: dto.to,
//                 from: userId,
//                 text: dto.text,
//             }as IMessages);

//              // Cập nhật thời gian gần nhất
//              chat.recent_date = new Date();
//             await chat.save();
//             return chat;
//               }else {
//                   const newChat =  new ChatSchema( {
//                  user1: userId,
//                 user2: dto.to,
//                 messages:[{
//                     from: userId,
//                     to: dto.to,
//                     text: dto.text
//                 }]
//             });
//            await newChat.save();
//            return newChat;
//               }
            
//                 }    else {
//             //trường hợp 2 user đã chat với nhau trước đó
//             const chat= await ChatSchema.findById(dto.chatId).exec();
//                 if(!chat) throw new httpException(400, " không có chat")
//             chat.messages.unshift({
//                 to: dto.to,
//                 from: userId,
//                 text: dto.text,
//             }as IMessages);

//              // Cập nhật thời gian gần nhất
//              chat.recent_date = new Date();
//             await chat.save();
//             return chat;
//           }     
//     }
// }