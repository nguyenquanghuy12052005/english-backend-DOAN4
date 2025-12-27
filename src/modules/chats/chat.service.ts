import { httpException } from "../../core/exceptions";
import { UserSchema } from "../users";
import { IChat, IMessages } from "./chat.interface";
import SendMessageDto from "./dtos/send.message.dto";
import ChatSchema from "./chat.model";

export default class ChatService {
  public async sendMessage(userId: string, dto: SendMessageDto): Promise<IChat> {
    
    if (!dto.to || !dto.text) {
      throw new httpException(400, "Thiếu dữ liệu gửi tin nhắn");
    }

    // Không cho gửi cho chính mình
    if (userId === dto.to) {
      throw new httpException(400, "Không thể gửi tin nhắn cho chính mình");
    }

    // Lấy user gửi
    const user = await UserSchema.findOne({ userId: userId }).select("-password").exec();
    if (!user) throw new httpException(400, "Không có user");

    //  Lấy user nhận 
    const toUser = await UserSchema.findOne({ userId: dto.to }).select("-password").exec();
    if (!toUser) throw new httpException(400, "Không có user để gửi");

    // gộp cặp user
    const ids = [userId, dto.to].sort();
    const user1 = ids[0];
    const user2 = ids[1];

    // Tìm chat duy nhất
    let chat = await ChatSchema.findOne({ user1, user2 }).exec();

    //ạo message
    const message: IMessages = {
      from: userId,
      to: dto.to,
      text: dto.text,
      read: false,
      date: new Date(),
      show_on_from: true,
      show_on_to: true,
    };

    //Tạo mới hoặc cập nhật chat
    if (!chat) {
      chat = new ChatSchema({
        user1,
        user2,
        messages: [message],
        start_date: new Date(),
        recent_date: new Date(),
      });
    } else {
      chat.messages.unshift(message);
      chat.recent_date = new Date();
    }

    
    await chat.save();
    return chat;
  }



  public async getChat(userId: string) : Promise<IChat[]> {
    const user = await UserSchema.findOne({userId: userId}).select("-password").exec();

    if (!user) throw new httpException(400, "Không có user");

    const chat = await ChatSchema.find({$or: [{ user1: userId }, { user2: userId }],}).sort({ recent_date: -1 }).exec();
     return chat;
  }
}
