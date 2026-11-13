
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'UUID of the order being paid for',
    example: 'f1e1fc0e-acbb-47c6-b2a3-33467f271582',
    format: 'uuid',
  })
  @IsUUID('4')
  orderId: string;
}

