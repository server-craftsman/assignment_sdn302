import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export default class LoginDto {
    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;
}
