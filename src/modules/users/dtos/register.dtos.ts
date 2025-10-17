export default class RegisterDto {

    constructor(email: string, name: string, password: string) {
        this.email = email;
        this.name = name;
        this.password = password;
    }


    public email: string ;
    public name: string ;
    public password: string ;


}