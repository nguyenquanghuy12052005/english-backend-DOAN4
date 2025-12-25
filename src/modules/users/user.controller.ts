import { NextFunction, Request, Response } from "express";
import UserService from "./user.service";
import RegisterDto from "./dtos/register.dtos";
import { TokenData } from "../auth";

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

    // =========================================================================
    // PHẦN MỚI THÊM: REGISTER ADMIN
    // =========================================================================
    public registerAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const tokenData: TokenData = await this.userService.createAdmin(model);
            res.status(201).json(tokenData);
        } catch (error) {
            next(error);
        }
    }

    // =========================================================================
    // PHẦN MỚI THÊM: LOGIN
    // =========================================================================
    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const result = await this.userService.login(model);
            // Trả về { token: "...", user: { role: "admin", ... } }
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
            // const keyword: string = req.params.keyword;
            const keyword: string = (req.query.keyword as string) || '';
            // const page: number = Number(req.params.page);
            const page: number = Number(req.query.page);
            //  console.log("keyword:", keyword, " | page:", page);
            const pagination = await this.userService.getAllUserPaging(keyword, page);
            res.status(200).json(pagination);
        } catch (error) {
            next(error);
        }
    }


    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const keyword: string = req.params.keyword      
            const resultr = await this.userService.deleteUser(req.params.id)
            res.status(200).json(resultr);
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
}