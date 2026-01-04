import { NextFunction, Request, Response } from "express";
import QuizService from "./quiz.service";

export default class QuizController {
    private quizService = new QuizService();

    // Create
    public createQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.quizService.createQuiz(req.body);
            res.status(201).json(result);
        } catch (error) { next(error); }
    }

    // Update
    public updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.quizService.updateQuiz(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    // Get All
    public getAllQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.quizService.getAllQUiz();
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    // Get One
    public getQuizById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.quizService.getQuizById(req.params.id);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    // Delete
    public deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.quizService.deleteQuiz(req.params.id);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    // Submit
    public submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.id; // Lấy ID từ Token (authMiddleware)
            const result = await this.quizService.submitQuiz(userId, req.body);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    // Get Result Detail
    public getQuizResultById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.quizService.getQuizResultById(req.params.id);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    // Get User History
    public getHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.id;
            const history = await this.quizService.getHistoryByUserId(userId);
            res.status(200).json(history);
        } catch (error) { next(error); }
    }
}