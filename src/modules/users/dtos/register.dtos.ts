import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export default class RegisterDto {

    constructor(email: string, name: string, password: string,  avatar?: string) {
        this.email = email;
        this.name = name;
        this.password = password;
         this.avatar = avatar;
    }


    @IsNotEmpty()
    @IsEmail()
    public email: string ;

    @IsNotEmpty()
    public name: string ;

    @IsNotEmpty()
    @MinLength(6)
    public password: string ;

  @IsOptional() 
    public avatar?: string;
}