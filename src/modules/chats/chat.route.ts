import { Router } from "express";
import { Route } from "../../core/interface";

import { adminMiddleware, authMiddleware, validationMiddleware } from "../../core/middleware";
import ChatsController from "./chat.controller";
import SendMessageDto from "./dtos/send.message.dto";



export default class ChatRoute implements Route{
    public path ="/api/chats";
    public router = Router();

    public chatController = new ChatsController();
    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // post data lên http://localhost:5000/api/posts
 
        this.router.post(this.path,authMiddleware, validationMiddleware(SendMessageDto, true), this.chatController.createChat); 

       

    }

} 
