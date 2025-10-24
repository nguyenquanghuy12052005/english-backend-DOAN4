import { Router } from "express";
import { Route } from "../../core/interface";
import UsersController from "./user.controller";

import RegisterDto from "./dtos/register.dtos";
import { authMiddleware, validationMiddleware } from "../../core/middleware";

export default class UserRoute implements Route{
    public path ="/api/users";
    public router = Router();

    public usersController = new UsersController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // post data lên http://localhost:5000/api/users
 
        this.router.post(this.path, validationMiddleware(RegisterDto, true), this.usersController.register); 

       

        this.router.put(this.path + '/:id', validationMiddleware(RegisterDto, true), this.usersController.updateUser); 
           // this.router.get(this.path + '/paging/:page/:keyword?', this.usersController.getAllUserPaging); 


                       //http://localhost:5000/api/users/paging?page=1&keyword=huy8  nếu tìm tên
                       //http://localhost:5000/api/users/paging?page=4    nếu phân trang
        this.router.get(this.path + '/paging', this.usersController.getAllUserPaging);



 this.router.get(this.path, this.usersController.getAllUser); 
        this.router.get(this.path + '/:id', this.usersController.getUserById); 

       
               this.router.delete(this.path +'/:id',authMiddleware, this.usersController.deleteUser); 

               // Thêm XP cho user
  this.router.post(this.path + '/:id/xp', authMiddleware, this.usersController.addXP);
  
  // Lấy tiến trình học tập
  this.router.get(this.path + '/:id/progress', authMiddleware, this.usersController.getUserProgress);
      
    }
} 