
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    fullName: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(150)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(72)
    password: string;
}
