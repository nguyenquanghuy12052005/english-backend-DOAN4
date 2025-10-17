import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class RegisterDto {

    constructor(email: string, name: string, password: string) {
        this.email = email;
        this.name = name;
        this.password = password;
    }


    @IsNotEmpty()
    @IsEmail()
    public email: string ;

    @IsNotEmpty()
    public name: string ;

    @IsNotEmpty()
    @MinLength(6)
    public password: string ;


}