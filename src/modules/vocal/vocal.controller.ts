import { NextFunction, Request, Response } from "express";
import VocalService from "./vocal.service";
import CreateVocalDto from "./dtos/create_vocal.dtos";

import { TokenData } from "../auth";
import { IVocal } from "./vocal.interface";

export default class VocalController {
    private vocalService = new VocalService();
   public createVocal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateVocalDto = req.body;
            const result: IVocal = await this.vocalService.createVocal(model);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

     public getVocById = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const vocId: string = req.params.id;
        const voc =  await this.vocalService.getVocById(vocId);
        res.status(200).json(voc);
        } catch (error) {
            next(error);
        }
    }

    public updateVoval = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const vocalId: string = req.params.id;
          const model: CreateVocalDto = req.body;
         const result: IVocal = await this.vocalService.updateVoc(vocalId,model);
        res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

       public getAllVoc = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const vocs =  await this.vocalService.getAllVoc();
        res.status(200).json(vocs);
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


       public deleteVoc = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          // const keyword: string = req.params.keyword      
            const resultr = await this.vocalService.deleteVoc(req.params.id)      
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