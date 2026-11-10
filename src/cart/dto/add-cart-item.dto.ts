
import {
  IsUUID,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class AddCartItemDto {
  @IsUUID('4')
  gameId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
