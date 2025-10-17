import { NextFunction, Request, Response } from "express";
import UserService from "./user.service";
import RegisterDto from "./dtos/register.dtos";
import { model } from "mongoose";

export default class UsersController {
    private userService = new UserService();
    public register = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const model: RegisterDto = req.body;
           await this.userService.createUser(model);
        } catch (error) {
            next(error);
        }
    }
}