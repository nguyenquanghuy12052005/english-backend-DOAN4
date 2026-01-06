import { Router } from "express";
import { Route } from "../../core/interface";
import QuizController from "./quiz.controller";
import { authMiddleware } from "../../core/middleware"; // Middleware kiểm tra đăng nhập

export default class QuizRoute implements Route {
    public path = "/api/quizzes";
    public router = Router();
    public quizController = new QuizController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post( `${this.path}/submit`, authMiddleware,  this.quizController.submitQuiz);


        this.router.get( `${this.path}/submit`,  authMiddleware,  this.quizController.getHistory);

        
        this.router.get(`${this.path}/submit/:id`, authMiddleware, this.quizController.getQuizResultById);

      
        this.router.post( this.path, authMiddleware,this.quizController.createQuiz);

        this.router.get(this.path, this.quizController.getAllQuiz);

        
        this.router.get(`${this.path}/:id`, this.quizController.getQuizById);

        this.router.put(`${this.path}/:id`, authMiddleware,  this.quizController.updateQuiz);

    
        this.router.delete( `${this.path}/:id`,  authMiddleware,  this.quizController.deleteQuiz);
    }
}