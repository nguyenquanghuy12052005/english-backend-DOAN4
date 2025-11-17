import { Router } from "express";
import { Route } from "../../core/interface";
import VocalController from "./vocal.controller";

import CreateVocalDto from "./dtos/create_vocal.dtos";
import { adminMiddleware, authMiddleware, validationMiddleware } from "../../core/middleware";


export default class VocalRoute implements Route{
    public path ="/api/vocals";
    public router = Router();

    public vocalController = new VocalController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // post data lên http://localhost:5000/api/users
 
        this.router.post(this.path, validationMiddleware(CreateVocalDto, true), this.vocalController.createVocal); 

       

        this.router.put(this.path + '/:id',  validationMiddleware(CreateVocalDto, true), this.vocalController.updateVoval); 
//            // this.router.get(this.path + '/paging/:page/:keyword?', this.usersController.getAllUserPaging); 


//                        //http://localhost:5000/api/users/paging?page=1&keyword=huy8  nếu tìm tên
//                        //http://localhost:5000/api/users/paging?page=4    nếu phân trang
//         this.router.get(this.path + '/paging', this.usersController.getAllUserPaging);



 this.router.get(this.path, this.vocalController.getAllVoc); 
        this.router.get(this.path + '/:id', this.vocalController.getVocById); 

       
               this.router.delete(this.path +'/:id', this.vocalController.deleteVoc); 

//                // Thêm XP cho user
//   this.router.post(this.path + '/:id/xp', authMiddleware, this.usersController.addXP);
  
//   // Lấy tiến trình học tập
//   this.router.get(this.path + '/:id/progress', authMiddleware, this.usersController.getUserProgress);
      
    }
} 