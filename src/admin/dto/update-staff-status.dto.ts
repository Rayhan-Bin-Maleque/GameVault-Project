
import { IsBoolean } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateStaffStatusDto {

    @ApiProperty({
        description: 'Set true to activate or false to deactivate the staff account.',
        example: true,
    })
    @IsBoolean()
    isActive: boolean;

}
