
import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffDto {

    @ApiPropertyOptional({
        description: 'Updated full name of the staff member.',
        example: 'GameVault Support Team',
        minLength: 2,
        maxLength: 120,
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    fullName?: string;

    @ApiPropertyOptional({
        description: 'Updated email address of the staff member.',
        example: 'support@gmail.com',
        maxLength: 150,
    })
    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;
}
