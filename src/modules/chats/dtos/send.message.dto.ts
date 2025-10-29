import { IsNotEmpty } from "class-validator";

export default class SendMessageDto {
    public chatId: string | undefined;
    
     @IsNotEmpty()
    public to: string | undefined;

    @IsNotEmpty()
    public text: string | undefined;
}