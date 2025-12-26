import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export default class SendFriendRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  public receiverId: string;

  constructor(receiverId: string) {
    this.receiverId = receiverId;
  }
}
