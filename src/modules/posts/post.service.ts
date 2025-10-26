import { PostSchema } from ".";
import { httpException } from "../../core/exceptions";
import { IPagination } from "../../core/interface";
import { UserSchema } from "../users";
import CreatePostDto from "./dto/create_post_dto";
import { Ilike, IPost } from "./post.interface";

export default class PostService {
    public async creatPost(userId: string, postDto: CreatePostDto) : Promise<IPost> {
      const user = await UserSchema.findOne({userId: userId}).select('-password').exec();

      if(!user) throw new httpException(400, " không có user")
        
      const newPost = new PostSchema({
         content: postDto.content,
         name: user.name,
         title: postDto.title,
         avatar: user.avatar,
         user: userId
      });
      const post = await newPost.save();
      return post;
    }

 public async updatePost(postId: string, postDto: CreatePostDto) : Promise<IPost> {
    const updatePostById  = await PostSchema.findByIdAndUpdate( postId, {...postDto},{ new: true }).exec();

    if(!updatePostById) throw new httpException(400, " lỗi update post") 

        return updatePostById;
 }


 public async getAllPost() : Promise<IPost[]> {
   const posts = await PostSchema.find().sort({ createdAt: -1, _id: -1}).exec();
   return posts;
 }

 public async getPostById(postId: string) : Promise<IPost> {
   const post = await PostSchema.findById(postId).exec();
        if(!post)  throw new httpException(404, " lỗi không có bài viết") ;
        return post;
 }

 public async getAllPostPaging(keyword: string, page: number): Promise<IPagination<IPost>> {
     const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
     const skip = (page - 1) * pageSize;
 
    // console.log(` SEARCH: keyword="${keyword}", page=${page}, pageSize=${pageSize}, skip=${skip}`);
 
     let baseQuery = PostSchema.find();
 
     if (keyword) {
         baseQuery = baseQuery.where('title', new RegExp(keyword, 'i'));
      //   console.log(`Applied filter: name contains "${keyword}"`);
     }
 
     const [users, total] = await Promise.all([
         baseQuery.clone()
             .sort({ createdAt: -1, _id: -1 })
             .skip(skip)
             .limit(pageSize)
             .exec(),
         baseQuery.countDocuments().exec()
     ]);
 
    // console.log(`RESULTS: total=${total}, found=${users.length} users`);
   //  console.log(` Users found:`, users.map(user => ({ name: user.name, email: user.email })));
 
     return {
         total: total,
         page: page,
         pageSize: pageSize,
         totalPages: Math.ceil(total / pageSize),
         items: users
     } as unknown as IPagination<IPost>;
 }


public async deletePost(userId: string, postId: string): Promise<IPost> {
   // Tìm post và kiểm tra quyền sở hữu
   const post = await PostSchema.findById(postId).exec();

   if (!post) {
      throw new httpException(404, "Không tìm thấy bài viết");
   }

   // Kiểm tra quyền sở hữu
   if (post.user.toString() !== userId) {
      throw new httpException(403, "Không có quyền xóa bài viết này");
   }

   // Xóa post
   const deletedPost = await PostSchema.findByIdAndDelete(postId).exec();
   
   if (!deletedPost) {
      throw new httpException(500, "Lỗi khi xóa bài viết");
   }

   return deletedPost;
}

public async likePost(userId: string,  postId: string) : Promise<Ilike[]> {
   const post = await PostSchema.findById(postId).exec();
   if(!post) throw new httpException(404, "Không tìm thấy bài viết");

    //  Kiểm tra user đã like bài viết này chưa
   if(post.like.some((like: Ilike) => like.user.toString() === userId)){
      throw new httpException(400, "bài viết đã like");
   }

   //Thêm like vào đầu mảng (unshift = thêm vào đầu)
   post.like.unshift({user: userId});

   await post.save();
   return post.like;

}


public async unlikePost(userId: string,  postId: string) : Promise<Ilike[]> {
   const post = await PostSchema.findById(postId).exec();
   if(!post) throw new httpException(404, "Không tìm thấy bài viết");

   if(!post.like.some((like: Ilike) => like.user.toString() === userId)){
      throw new httpException(400, "bài viết chưa like");
   }

   // //  Lọc bỏ like của user khỏi mảng
  post.like =  post.like.filter(({user}) =>user.toString() !== userId );

   await post.save();
   return post.like;

}

}