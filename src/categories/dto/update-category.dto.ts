
import {IsOptional,IsString,MaxLength,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {

    @ApiPropertyOptional({
    description: 'Updated category name',
    example: 'Role Playing Games',
    maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;
    
    @ApiPropertyOptional({
    description: 'Updated category description',
    example: 'Games focused on character development and storytelling',
  })
    @IsOptional()
    @IsString()
    description?: string;

}
