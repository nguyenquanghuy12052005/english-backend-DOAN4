import { Router } from "express";
import { Route } from "../../core/interface";
import UsersController from "./user.controller";

import RegisterDto from "./dtos/register.dtos";
import { validationMiddleware } from "../../core/middleware";

export default class UserRoute implements Route{
    public path ="/api/users";
    public router = Router();

    public usersController = new UsersController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // post data lên http://localhost/5000/api/users
 
          this.router.post(this.path, validationMiddleware(RegisterDto, true), this.usersController.register); 
    }
}