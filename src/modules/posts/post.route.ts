import { Router } from "express";
import { Route } from "../../core/interface";

import { adminMiddleware, authMiddleware, validationMiddleware } from "../../core/middleware";
import PostsController from "./post.controller";
import CreatePostDto from "./dto/create_post_dto";
import CreateCommentDto from "./dto/create_comment_dto";


export default class PostRoute implements Route{
    public path ="/api/posts";
    public router = Router();

    public postsController = new PostsController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // post data lên http://localhost:5000/api/posts
 
        this.router.post(this.path,authMiddleware, validationMiddleware(CreatePostDto, true), this.postsController.createPost); 

        this.router.put(this.path + '/:id', authMiddleware, validationMiddleware(CreatePostDto, true), this.postsController.updatePost); 


        this.router.get(this.path + '/paging', this.postsController.getAllPostPaging);



        //http://localhost:5000/api/posts/paging?page=1&keyword=contenmuoimot nếu tìm tên
        //http://localhost:5000/api/posts/paging?page=1    nếu phân trang
        this.router.get(this.path, this.postsController.getAllPosts); 
        this.router.get(this.path + '/:id', this.postsController.getPostById); 

        this.router.delete(this.path + '/:id',authMiddleware, this.postsController.deletePost); 

        this.router.put(this.path + '/like/:id',authMiddleware, this.postsController.likePost); 
        this.router.put(this.path + '/unlike/:id', authMiddleware,this.postsController.unlikePost); 


         this.router.post(this.path + '/comments/:id',authMiddleware,validationMiddleware(CreateCommentDto, true), this.postsController.addComment); 
        this.router.delete(this.path + '/comments/:id/:commentId', authMiddleware,this.postsController.deleteComment); 


    }

} 
