import { NextFunction, Request, Response } from "express";

import { TokenData } from "../auth";
import ChatService from "./chat.service";
import SendMessageDto from "./dtos/send.message.dto";

export default class ChatController {
    private chatService = new ChatService();
    public createChat = async (req: Request, res: Response, next: NextFunction) =>{
        try {
        
        const model: SendMessageDto = req.body; 
        const  userId = req.user.id;
        const result =   await this.chatService.sendMessage(userId, model);
        res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }


   

    
}