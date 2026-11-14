
import {
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {

  @ApiProperty({
    description: 'UUID of the active support agent who will be assigned to the support ticket.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  supportAgentId: string;
}
