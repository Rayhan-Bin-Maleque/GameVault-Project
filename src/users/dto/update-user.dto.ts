
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    IsBoolean,
    MaxLength,
} from 'class-validator';

import { UserRole } from '../entities/user.entity.js';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MaxLength(120)
    fullName?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
