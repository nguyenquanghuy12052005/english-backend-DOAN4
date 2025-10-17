import { Router } from "express";
import { Route } from "../../core/interface";


import AuthController from "./auth.controller";

export default class AuthRoute implements Route{
    public path ="/api/auth";
    public router = Router();

    public authController = new AuthController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // post data lên http://localhost:5000/api/auth
 
          this.router.post(this.path,this.authController.login); 
    }
}