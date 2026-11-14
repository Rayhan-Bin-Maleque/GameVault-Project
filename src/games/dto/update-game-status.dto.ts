import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateGameStatusDto {
  @IsDefined()
  @IsBoolean()
  isActive: boolean;
}
