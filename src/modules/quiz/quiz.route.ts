import { Router } from "express";
import { Route } from "../../core/interface";
import QuizController from "./quiz.controller";
import CreateQuizDto from "./dtos/create_quiz.dtos";
import { authMiddleware, validationMiddleware } from "../../core/middleware"; // Bỏ adminMiddleware nếu chưa dùng

export default class QuizRoute implements Route {
    public path = "/api/quizzes";
    public router = Router();

    public quizController = new QuizController();

    constructor() {  
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Tạo Quiz
        this.router.post(this.path, this.quizController.createQuiz);

        // Cập nhật Quiz
        this.router.put(this.path + '/:id', validationMiddleware(CreateQuizDto, true), this.quizController.updateQuiz); 

        // Lấy tất cả Quiz
        this.router.get(this.path, this.quizController.getAllQuiz); 
        
        // Lấy Quiz theo ID
        this.router.get(this.path + '/:id', this.quizController.getQuizById); 

        // Xóa Quiz
        this.router.delete(this.path +'/:id', this.quizController.deleteQuiz); 

        // Lấy kết quả Quiz
        this.router.get(this.path + '/submit/:id', this.quizController.getQuizResultById); 

        // Submit Quiz
        this.router.post(this.path + '/submit', authMiddleware, this.quizController.submitQuiz);
    }
}