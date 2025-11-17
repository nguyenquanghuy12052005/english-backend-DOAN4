import { Router } from "express";
import { Route } from "../../core/interface";
import QuizController from "./quiz.controller";

import CreateQuizDto from "./dtos/create_quiz.dtos";
import { adminMiddleware, authMiddleware, validationMiddleware } from "../../core/middleware";


export default class QuizRoute implements Route{
    public path ="/api/quizzes";
    public router = Router();

    public quizController = new QuizController();

    constructor(){  console.log('🎯 QuizRoute constructor called');
        this.initializeRoutes();
    }

    private initializeRoutes() {
      console.log('🔄 Initializing quiz routes...');
    
    this.router.post(this.path, (req, res, next) => {
        console.log('✅ POST /api/quizzes reached!');
        this.quizController.createQuiz(req, res, next);
    });


       

  //      this.router.put(this.path + '/:id',  validationMiddleware(CreateVocalDto, true), this.vocalController.updateVoval); 
//            // this.router.get(this.path + '/paging/:page/:keyword?', this.usersController.getAllUserPaging); 


//                        //http://localhost:5000/api/users/paging?page=1&keyword=huy8  nếu tìm tên
//                        //http://localhost:5000/api/users/paging?page=4    nếu phân trang
//         this.router.get(this.path + '/paging', this.usersController.getAllUserPaging);



//  this.router.get(this.path, this.vocalController.getAllVoc); 
//         this.router.get(this.path + '/:id', this.vocalController.getVocById); 

       
//                this.router.delete(this.path +'/:id', this.vocalController.deleteVoc); 

//                // Thêm XP cho user
//   this.router.post(this.path + '/:id/xp', authMiddleware, this.usersController.addXP);
  
//   // Lấy tiến trình học tập
//   this.router.get(this.path + '/:id/progress', authMiddleware, this.usersController.getUserProgress);
      
    }
} 