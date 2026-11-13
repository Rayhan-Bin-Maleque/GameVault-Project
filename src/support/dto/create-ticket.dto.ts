import {Transform}  from 'class-transformer';

import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsEnum,
    IsIn,
} from 'class-validator';

import {
    TicketCategory,
    TicketPriority,
} from '../entities/support-ticket.entity.js'

export class CreateTicketDto{
    @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsIn([
    TicketPriority.LOW,
    TicketPriority.MEDIUM,
    TicketPriority.HIGH,
  ])
  priority: TicketPriority;
}

