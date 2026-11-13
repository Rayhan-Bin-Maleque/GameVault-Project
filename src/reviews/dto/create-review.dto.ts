import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'UUID of the game being reviewed',
    example: 'a93f5ce4-e3cc-4ca2-a9af-309fb64890b6',
    format: 'uuid',
  })
  @IsUUID()
  gameId!: string;

  @ApiProperty({
    description: 'Game rating from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Optional written review',
    example: 'Excellent game!',
    maxLength: 1000,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string | null;
}

