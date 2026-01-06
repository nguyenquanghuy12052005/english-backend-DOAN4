import { NextFunction, Request, Response } from "express";
import UserService from "./user.service";
import RegisterDto from "./dtos/register.dtos";
import { TokenData } from "../auth";
import SendFriendRequestDto from "./dtos/sendFriendRequest.dto";

export default class UsersController {
    private userService = new UserService();

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const tokenData: TokenData = await this.userService.createUser(model);
            res.status(201).json(tokenData);
        } catch (error) {
            next(error);
        }
    }

    public registerAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const tokenData: TokenData = await this.userService.createAdmin(model);
            res.status(201).json(tokenData);
        } catch (error) {
            next(error);
        }
    }

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const result = await this.userService.login(model);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const user = await this.userService.getUserById(userId);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const model: RegisterDto = req.body;
            const user = await this.userService.updateUser(userId, model);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    public getAllUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getAllUser();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    public getAllUserPaging = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const keyword: string = (req.query.keyword as string) || '';
            const page: number = Number(req.query.page) || 1;
            const pagination = await this.userService.getAllUserPaging(keyword, page);
            res.status(200).json(pagination);
        } catch (error) {
            next(error);
        }
    }

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.userService.deleteUser(req.params.id)
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public addXP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const xp: number = Number(req.body.xp)
            const user = await this.userService.addXP(userId, xp);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    public getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const progress = await this.userService.getUserProgress(userId);
            res.status(200).json(progress);
        } catch (error) {
            next(error);
        }
    }



    public sendFriendRequest = async (req: any, res: Response, next: NextFunction) => {
        try {
            const senderId = req.user.id; 
            const dto: SendFriendRequestDto = req.body; 
            const request = await this.userService.sendFriendRequest(senderId, dto.receiverId);
            res.status(201).json(request);
        } catch (error) {
            next(error);
        }
    }

    public acceptFriendRequest = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const requestId = req.params.requestId;          
            const user = await this.userService.acceptFriendRequest(requestId, userId);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    public rejectFriendRequest = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const requestId = req.params.requestId;
            await this.userService.rejectFriendRequest(requestId, userId);
            res.status(200).json({ message: "Đã từ chối yêu cầu kết bạn" });
        } catch (error) {
            next(error);
        }
    }

    public cancelFriendRequest = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const requestId = req.params.requestId;
            await this.userService.cancelFriendRequest(requestId, userId);
            res.status(200).json({ message: "Đã hủy yêu cầu kết bạn" });
        } catch (error) {
            next(error);
        }
    }

    public removeFriend = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const friendId = req.params.friendId;
            const user = await this.userService.removeFriend(userId, friendId);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    public getPendingRequests = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const requests = await this.userService.getPendingRequests(userId);
            res.status(200).json(requests);
        } catch (error) {
            next(error);
        }
    }

    public getFriends = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const friends = await this.userService.getFriends(userId);
            res.status(200).json(friends);
        } catch (error) {
            next(error);
        }
    }
}