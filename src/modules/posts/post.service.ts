import { text } from "stream/consumers";
import { PostSchema } from ".";
import { httpException } from "../../core/exceptions";
import { IPagination } from "../../core/interface";
import { UserSchema } from "../users";
import CreateCommentDto from "./dto/create_comment_dto";
import CreatePostDto from "./dto/create_post_dto";
import { Icomments, Ilike, IPost } from "./post.interface";

export default class PostService {
    public async creatPost(userId: string, postDto: CreatePostDto) : Promise<IPost> {
      const user = await UserSchema.findOne({userId: userId}).select('-password').exec();

      if(!user) throw new httpException(400, " không có user")
        
      const newPost = new PostSchema({
         content: postDto.content,
         name: user.name,
         title: postDto.title,
         image: postDto.image,
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

public async addComment(comment: CreateCommentDto) : Promise<Icomments[]>{
  const post = await PostSchema.findById(comment.postId).exec();
   if(!post) throw new httpException(404, "Không tìm thấy bài viết");
   
    const user = await UserSchema.findOne({userId: comment.userId}).select('-password').exec();
        if(!user) throw new httpException(400, " không có user")

         const newComment  = {
            content: comment.content!,
            name: user.name!,
            avatar: user.avatar!,
            user: comment.userId!,
         };
         post.comments.unshift(newComment as Icomments);
         await post.save();
         return post.comments;
}


// public async deleteComment(commentId: string, postId: string, userId: string) : Promise<Icomments[]>{

//    //tìm bài viết
//   const post = await PostSchema.findById(postId).exec();
//    if(!post) throw new httpException(400, "Không tìm thấy bài viết");


//    //tìm comment
//    //vì ss === là nó ss cả kiểu dữ liệu nên phải add về toString
//    const comment = post.comments.find((c) => c._id.toString() === commentId);
//    if(!comment) throw new httpException(400, "Không tìm thấy comment");

//    if(comment.user.toString() !== userId)  throw new httpException(401, "không có quyền xoá comment");

//          post.comments =  post.comments.filter(({_id}) => _id.toString() !== commentId);
//          await post.save();
//          return post.comments;
// }



public async deleteComment(commentId: string, postId: string, userId: string): Promise<Icomments[]> {
    console.log('=== DEBUG DELETE COMMENT ===');
    console.log('postId received:', postId);
    console.log('commentId received:', commentId);
    console.log('userId received:', userId);
    
    // 1. Tìm bài viết
    const post = await PostSchema.findById(postId).exec();
    console.log('Post found:', post);
    
    if(!post) {
        console.log('Post not found with ID:', postId);
        
        // Kiểm tra xem có bài viết nào trong database không
        const allPosts = await PostSchema.find().select('_id title').limit(5).exec();
        console.log('First 5 posts in DB:', allPosts);
        
        throw new httpException(404, "Không tìm thấy bài viết");
    }

    // 2. Tìm comment
    console.log('All comments in post:', post.comments);
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    console.log('Comment found:', comment);
    
    if(!comment) {
        console.log('Comment not found with ID:', commentId);
        console.log('Available comment IDs:', post.comments.map(c => c._id.toString()));
        throw new httpException(404, "Không tìm thấy comment");
    }

    // 3. Kiểm tra quyền
    console.log('Comment user:', comment.user.toString());
    console.log('Request user:', userId);
    
    if(comment.user.toString() !== userId) {
        throw new httpException(401, "không có quyền xoá comment");
    }

    // 4. Xóa comment
    post.comments = post.comments.filter(({_id}) => _id.toString() !== commentId);
    await post.save();
    
    console.log('Comment deleted successfully');
    return post.comments;
}

}