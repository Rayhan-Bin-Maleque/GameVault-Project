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
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    protocols: ['http', 'https'],
  })
  @MaxLength(500)
  imageUrl: string;

  @IsDateString({ strict: true })
  releaseDate: Date;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
