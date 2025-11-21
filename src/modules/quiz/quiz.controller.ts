import { NextFunction, Request, Response } from "express";
import QuizService from "./quiz.service";
import CreateQuizDto from "./dtos/create_quiz.dtos";

import { TokenData } from "../auth";
import { IQuiz } from "./quiz.interface";
import SubmitQuizDto from "./dtos/submit_quiz.dtos";

export default class QuizController {
    private quizService = new QuizService();
 // quiz.controller.ts
public createQuiz = async (req: Request, res: Response, next: NextFunction) => {
   
    try {
        const model: CreateQuizDto = req.body;

        const result: IQuiz = await this.quizService.createQuiz(model);
     
        res.status(201).json(result);
    } catch (error) {
     
        next(error);
    }
}

     public getQuizById = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const quizId: string = req.params.id;
        const quiz =  await this.quizService.getQuizById(quizId);
        res.status(200).json(quiz);
        } catch (error) {
            next(error);
        }
    }

    public updateQuiz = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const quizId: string = req.params.id;
          const model: CreateQuizDto = req.body;
         const result: IQuiz = await this.quizService.updateQuiz(quizId,model);
        res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

       public getAllQuiz = async (req: Request, res: Response, next: NextFunction) =>{
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
            
            // Lấy user ID từ token sau khi middleware ở cái route
          const  userId = req.user.id;
            
        
          
            const result = await this.quizService.submitQuiz(userId, model);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

  //      public getAllUserPaging = async (req: Request, res: Response, next: NextFunction) =>{
  //       try {
  //         // const keyword: string = req.params.keyword;
  //           const keyword: string = (req.query.keyword as string) || '';
  //         // const page: number = Number(req.params.page);
  //           const page: number = Number(req.query.page);
  //         //  console.log("keyword:", keyword, " | page:", page);
  //         const pagination =  await this.userService.getAllUserPaging(keyword, page);
  //       res.status(200).json(pagination);
  //       } catch (error) {
  //           next(error);
  //       }
  //   }


       public deleteQuiz = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          // const keyword: string = req.params.keyword      
            const resultr = await this.quizService.deleteQuiz(req.params.id)      
        res.status(200).json(resultr);
        } catch (error) {
            next(error);
        }
    }

  //  public addXP = async (req: Request, res: Response, next: NextFunction) =>{
  //       try {
  //           const userId: string = req.params.id;
  //           const xp: number = Number(req.body.xp)

  //           const user = await this.userService.addXP(userId, xp);
  //       res.status(200).json(user);
  //       } catch (error) {
  //           next(error);
  //       }
  //   }

  //   public getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId: string = req.params.id;
  //     const progress = await this.userService.getUserProgress(userId);
  //     res.status(200).json(progress);
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}