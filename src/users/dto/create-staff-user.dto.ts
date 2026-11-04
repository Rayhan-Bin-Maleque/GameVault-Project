
import {
    IsEmail,
    IsEnum,
    IsIn,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { UserRole } from '../entities/user.entity.js';

export class CreateStaffUserDto {

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

    @IsIn([UserRole.PUBLISHER, UserRole.SUPPORT])
    role: UserRole.PUBLISHER | UserRole.SUPPORT;

}
