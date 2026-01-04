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
        // --- CÁC ROUTE ĐẶC BIỆT PHẢI ĐẶT TRƯỚC ROUTE CÓ PARAM :id ---

        // 1. Submit bài thi
        this.router.post(
            `${this.path}/submit`, 
            authMiddleware, 
            this.quizController.submitQuiz
        );

        // 2. Lấy lịch sử thi của User (GET /quizzes/submit)
        // Frontend gọi endpoint này: axios.get('/quizzes/submit')
        this.router.get(
            `${this.path}/submit`, 
            authMiddleware, 
            this.quizController.getHistory
        );

        // 3. Xem chi tiết kết quả bài thi (GET /quizzes/submit/:id)
        this.router.get(
            `${this.path}/submit/:id`, 
            authMiddleware, // Có thể bỏ auth nếu muốn share kết quả công khai
            this.quizController.getQuizResultById
        );

        // --- CÁC ROUTE CRUD CƠ BẢN ---

        // 4. Tạo mới Quiz
        this.router.post(
            this.path, 
            authMiddleware, // Chỉ Admin/Teacher mới đc tạo (tùy logic của bạn)
            this.quizController.createQuiz
        );

        // 5. Lấy danh sách Quiz
        this.router.get(this.path, this.quizController.getAllQuiz);

        // 6. Lấy chi tiết 1 Quiz (để làm bài)
        this.router.get(`${this.path}/:id`, this.quizController.getQuizById);

        // 7. Cập nhật Quiz
        this.router.put(
            `${this.path}/:id`, 
            authMiddleware, 
            this.quizController.updateQuiz
        );

        // 8. Xóa Quiz
        this.router.delete(
            `${this.path}/:id`, 
            authMiddleware, 
            this.quizController.deleteQuiz
        );
    }
}