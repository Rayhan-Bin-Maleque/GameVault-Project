import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateGameDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  @ApiProperty({
    description: 'Name of the game',
    example: 'Shadow Legends',
    maxLength: 150,
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({
    description: 'Game description',
    example: 'An adventure RPG with multiplayer gameplay.',
    maxLength: 2000,
  })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  @Type(() => Number)
  @ApiProperty({
    description: 'Game price',
    example: 29.99,
    minimum: 0.01,
  })
  price: number;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    protocols: ['http', 'https'],
  })
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Game cover image URL',
    example: 'https://example.com/game-cover.jpg',
    format: 'uri',
  })
  imageUrl?: string;

  @IsDateString({ strict: true })
  @ApiProperty({
    description: 'Game release date',
    example: '2026-12-15',
    type: String,
    format: 'date',
  })
  releaseDate: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'UUIDs of game categories',
    example: [
      '6f887b2e-9029-48cb-a0df-61f648f2bdc5',
      'bae6c6d2-968e-418c-a1a2-59e80a1bfe9a',
    ],
    type: [String],
  })
  categoryIds?: string[];
}
