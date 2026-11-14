
import {
  IsUUID,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({
    description: 'UUID of the game to add to the cart',
    example: 'a93f5ce4-e3cc-4ca2-a9af-309fb64890b6',
    format: 'uuid',
  })
  @IsUUID('4')
  gameId: string;

  @ApiPropertyOptional({
    description: 'Number of copies to add (defaults to 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

