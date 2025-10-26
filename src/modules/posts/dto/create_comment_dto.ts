import { IsNotEmpty} from "class-validator";

export default class CreateCommentDto {

   @IsNotEmpty()
   public content: string | undefined ;

    @IsNotEmpty()
   public userId: string | undefined;

   @IsNotEmpty()
   public postId: string | undefined;
}