import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString() @IsEmail()      email: string;
    @IsString()                 name: string;
    @IsString() @MinLength(6)   password: string;
}
