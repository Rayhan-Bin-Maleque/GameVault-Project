import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateGameStatusDto {
  @IsDefined()
  @IsBoolean()
  @ApiProperty({
    description: 'Set true to activate or false to deactivate the game.',
    example: false,
    type: Boolean,
  })
  isActive: boolean;
}
