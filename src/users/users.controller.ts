
import {
    Controller,
    Get,
    UseGuards,
    Req,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from './entities/user.entity.js';

@Controller('users')
export class UsersController {

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: any) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('admin-test')
    adminTest() {
        return {
            message: 'Welcome Admin! Access granted.'
        };
    }
}
