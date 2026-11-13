
import { IsEnum } from 'class-validator';

import {
  TicketPriority,
} from '../entities/support-ticket.entity.js';

export class UpdateTicketPriorityDto {
  @IsEnum(TicketPriority)
  priority: TicketPriority;
}
