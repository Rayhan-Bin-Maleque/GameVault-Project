
import { Transform } from 'class-transformer';

import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateMessageDto {
  @Transform(({ value }) =>
    
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  message: string;
}
