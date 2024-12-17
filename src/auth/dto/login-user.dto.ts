import { MinLength } from 'class-validator';
import { IsEmail, IsString, minLength } from 'class-validator';
export class LoginUser {
    @IsString() @IsEmail()      email: string;
    @IsString() @MinLength(6)   password: string;
}