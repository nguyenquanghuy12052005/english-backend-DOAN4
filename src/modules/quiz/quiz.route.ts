import { Router } from "express";
import { Route } from "../../core/interface";
import QuizController from "./quiz.controller";

import CreateQuizDto from "./dtos/create_quiz.dtos";
import { adminMiddleware, authMiddleware, validationMiddleware } from "../../core/middleware";


export default class QuizRoute implements Route{
    public path ="/api/quizzes";
    public router = Router();

    public quizController = new QuizController();

    constructor(){  
        this.initializeRoutes();
    }

    private initializeRoutes() {
      
    
    this.router.post(this.path, (req, res, next) => {
      
        this.quizController.createQuiz(req, res, next);
    });


       

       this.router.put(this.path + '/:id',  validationMiddleware(CreateQuizDto, true), this.quizController.updateQuiz); 
//            // this.router.get(this.path + '/paging/:page/:keyword?', this.usersController.getAllUserPaging); 


//                        //http://localhost:5000/api/users/paging?page=1&keyword=huy8  nếu tìm tên
//                        //http://localhost:5000/api/users/paging?page=4    nếu phân trang
//         this.router.get(this.path + '/paging', this.usersController.getAllUserPaging);



 this.router.get(this.path, this.quizController.getAllQuiz); 
        this.router.get(this.path + '/:id', this.quizController.getQuizById); 

       
               this.router.delete(this.path +'/:id', this.quizController.deleteQuiz); 

                this.router.get(this.path + '/submit/:id', this.quizController.getQuizResultById); 

//                // Thêm XP cho user
//   this.router.post(this.path + '/:id/xp', authMiddleware, this.usersController.addXP);
  
//   // Lấy tiến trình học tập
//   this.router.get(this.path + '/:id/progress', authMiddleware, this.usersController.getUserProgress);
    

//submit

 this.router.post(this.path + '/submit',authMiddleware, this.quizController.submitQuiz);
    }
} 