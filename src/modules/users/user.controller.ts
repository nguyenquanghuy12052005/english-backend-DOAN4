import { NextFunction, Request, Response } from "express";
import UserService from "./user.service";
import RegisterDto from "./dtos/register.dtos";

import { TokenData } from "../auth";

export default class UsersController {
    private userService = new UserService();
    public register = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const model: RegisterDto = req.body;
        const tokenData: TokenData =  await this.userService.createUser(model);
        res.status(201).json(tokenData);
        } catch (error) {
            next(error);
        }
    }


     public getUserById = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const userId: string = req.params.id;
        const user =  await this.userService.getUserById(userId);
        res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    public updateUser = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const userId: string = req.params.id;
          const model: RegisterDto = req.body;
          const user =  await this.userService.updateUser(userId, model);
        res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
}