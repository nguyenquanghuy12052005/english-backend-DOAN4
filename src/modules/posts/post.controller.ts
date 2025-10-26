import { NextFunction, Request, Response } from "express";

import { TokenData } from "../auth";
import PostService from "./post.service";
import CreatePostDto from "./dto/create_post_dto";
import { IPost } from "./post.interface";

export default class PostsController {
    private postService = new PostService();
    public createPost = async (req: Request, res: Response, next: NextFunction) =>{
        try {
        
        const model: CreatePostDto = req.body; 
        const  userId = req.user.id;
        const result =   await this.postService.creatPost(userId, model);
        res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }


    public updatePost = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          const  postId = req.params.id;
          const model: CreatePostDto = req.body;
        const result =   await this.postService.updatePost(postId, model);
        res.status(200).json(result);
        } catch (error) {
            next(error); 
        }
    }

    public getAllPosts = async (req: Request, res: Response, next: NextFunction) =>{
        try {
            const posts: IPost[] = await this.postService.getAllPost();
              res.status(200).json(posts);
      } catch (error) {
            next(error); 
        }
    }

      public getPostById = async (req: Request, res: Response, next: NextFunction) =>{
        try {
        const  postId = req.params.id;
            const post: IPost = await this.postService.getPostById(postId);
              res.status(200).json(post);
      } catch (error) {
            next(error); 
        }
    }

    public getAllPostPaging = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          // const keyword: string = req.params.keyword;
            const keyword: string = (req.query.keyword as string) || '';
          // const page: number = Number(req.params.page);
            const page: number = Number(req.query.page);
          //  console.log("keyword:", keyword, " | page:", page);
          const pagination =  await this.postService.getAllPostPaging(keyword, page);
        res.status(200).json(pagination);
        } catch (error) {
            next(error);
        }
    }


      public deletePost = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          // const keyword: string = req.params.keyword     
                  const  userId = req.user.id; 
                  const postId = req.params.id;
            const resultr = await this.postService.deletePost(userId,postId)      
        res.status(200).json(resultr);
        } catch (error) {
            next(error);
        }
    }


    
      public likePost = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          // const keyword: string = req.params.keyword     
                  const  userId = req.user.id; 
                  const postId = req.params.id;
            const likes = await this.postService.likePost(userId,postId)      
        res.status(200).json(likes);
        } catch (error) {
            next(error);
        }
    }


       public unlikePost = async (req: Request, res: Response, next: NextFunction) =>{
        try {
          // const keyword: string = req.params.keyword     
                  const  userId = req.user.id; 
                  const postId = req.params.id;
            const likes = await this.postService.unlikePost(userId,postId)      
        res.status(200).json(likes);
        } catch (error) {
            next(error);
        }
    }

    
}