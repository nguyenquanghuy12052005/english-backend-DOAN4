import { NextFunction, Request, Response } from "express";
import QuizService from "./quiz.service";
import CreateQuizDto from "./dtos/create_quiz.dtos";
import { TokenData } from "../auth";
import { IQuiz } from "./quiz.interface";
import SubmitQuizDto from "./dtos/submit_quiz.dtos"; // Lưu ý file này bạn cần có

export default class QuizController {
    private quizService = new QuizService();

    public createQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateQuizDto = req.body;
            const result: IQuiz = await this.quizService.createQuiz(model);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    public getQuizById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quizId: string = req.params.id;
            const quiz =  await this.quizService.getQuizById(quizId);
            res.status(200).json(quiz);
        } catch (error) {
            next(error);
        }
    }

    public updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quizId: string = req.params.id;
            const model: CreateQuizDto = req.body;
            const result: IQuiz = await this.quizService.updateQuiz(quizId, model);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public getAllQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quizzes =  await this.quizService.getAllQUiz();
            res.status(200).json(quizzes);
        } catch (error) {
            next(error);
        }
    }

    public submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SubmitQuizDto = req.body;
            
            // Lấy user ID từ token (cần đảm bảo middleware auth đã chạy và gắn user vào req)
            const userId = (req as any).user.id; 
            
            const result = await this.quizService.submitQuiz(userId, model);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resultr = await this.quizService.deleteQuiz(req.params.id)      
            res.status(200).json(resultr);
        } catch (error) {
            next(error);
        }
    }

    public getQuizResultById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quizId: string = req.params.id;
            const quiz =  await this.quizService.getQuizResultById(quizId);
            res.status(200).json(quiz);
        } catch (error) {
            next(error);
        }
    }
}