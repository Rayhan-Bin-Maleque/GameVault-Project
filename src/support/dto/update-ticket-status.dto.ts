import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
  TicketStatus,
} from '../entities/support-ticket.entity.js';

export class UpdateTicketStatusDto {

  @ApiProperty({
    description: 'New status for the assigned support ticket. OPEN cannot be set directly. A RESOLVED ticket can only remain RESOLVED or move to CLOSED. Reopening requests currently record a timestamp but do not directly reopen the ticket.',
    enum: [
      TicketStatus.ASSIGNED,
      TicketStatus.IN_PROGRESS,
      TicketStatus.WAITING_FOR_CUSTOMER,
      TicketStatus.RESOLVED,
      TicketStatus.CLOSED,
    ],
    example: TicketStatus.IN_PROGRESS,
  })
  @IsIn([
    TicketStatus.ASSIGNED,
    TicketStatus.IN_PROGRESS,
    TicketStatus.WAITING_FOR_CUSTOMER,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ])
  status: TicketStatus;
}