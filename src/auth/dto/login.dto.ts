
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

    @ApiProperty({
        description: 'Registered email address of the user.',
        example: 'customer@gmail.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Account password. Must contain between 8 and 72 characters.',
        example: '12345678',
        minLength: 8,
        maxLength: 72,
        format: 'password',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(72)
    password: string;

}
