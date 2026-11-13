
import {IsNotEmpty,IsOptional,IsString,MaxLength,} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateCategoryDto {

     @ApiProperty({
    description: 'Name of the game category',
    example: 'Action',
    maxLength: 100,
  })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;


     @ApiPropertyOptional({
    description: 'Description of the game category',
    example: 'Action and adventure games',
  })
    @IsOptional()
    @IsString()
    description?: string;

}
