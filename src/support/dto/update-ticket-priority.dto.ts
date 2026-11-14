
import { IsEnum } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import {
  TicketPriority,
} from '../entities/support-ticket.entity.js';
export class UpdateTicketPriorityDto {

  @ApiProperty({
    description: 'New priority level for the assigned support ticket.',
    enum: TicketPriority,
    example: TicketPriority.HIGH,
  })
  @IsEnum(TicketPriority)
  priority: TicketPriority;
}
