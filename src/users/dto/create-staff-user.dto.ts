
import {
    IsEmail,
    IsIn,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../entities/user.entity.js';

export class CreateStaffUserDto {

    @ApiProperty({
        description: 'Full name of the staff member.',
        example: 'GameVault Support',
        maxLength: 120,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    fullName: string;

    @ApiProperty({
        description: 'Unique email address of the staff member.',
        example: 'support@gmail.com',
        maxLength: 150,
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(150)
    email: string;

    @ApiProperty({
        description: 'Password for the new staff account.',
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

    @ApiProperty({
        description: 'Staff account role. Only PUBLISHER and SUPPORT are permitted.',
        enum: [
            UserRole.PUBLISHER,
            UserRole.SUPPORT,
        ],
        example: UserRole.SUPPORT,
    })
    @IsIn([
        UserRole.PUBLISHER,
        UserRole.SUPPORT,
    ])
    role: UserRole.PUBLISHER | UserRole.SUPPORT;

}
