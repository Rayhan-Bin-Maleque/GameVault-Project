
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {

    @ApiProperty({
        description: 'Full name of the customer.',
        example: 'John Smith',
        maxLength: 120,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    fullName: string;

    @ApiProperty({
        description: 'Unique email address for the customer account.',
        example: 'customer@gmail.com',
        maxLength: 150,
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(150)
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
