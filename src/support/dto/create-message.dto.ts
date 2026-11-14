
import { Transform } from 'class-transformer';

import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {

  @ApiProperty({
    description: 'Message content sent by the customer or support agent.',
    example: 'I have completed the payment, but the purchased game is not appearing in my library.',
    type: String,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  message: string;
}
