
import { Transform } from 'class-transformer';

import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsIn,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import {
  TicketCategory,
  TicketPriority,
} from '../entities/support-ticket.entity.js';

export class CreateTicketDto {

  @ApiProperty({
    description: 'Short subject describing the customer support issue.',
    example: 'Unable to access purchased game',
    maxLength: 200,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Detailed explanation of the problem encountered by the customer.',
    example: 'I completed my payment but the purchased game is not showing in my library.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category of the support issue.',
    enum: TicketCategory,
    example: TicketCategory.GAME,
  })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiProperty({
    description: 'Priority level of the support ticket. Customers can select LOW, MEDIUM or HIGH. URGENT priority is reserved for support management.',
    enum: [
      TicketPriority.LOW,
      TicketPriority.MEDIUM,
      TicketPriority.HIGH,
    ],
    example: TicketPriority.MEDIUM,
  })
  @IsIn([
    TicketPriority.LOW,
    TicketPriority.MEDIUM,
    TicketPriority.HIGH,
  ])
  priority: TicketPriority;
}
