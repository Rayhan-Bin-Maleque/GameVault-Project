
import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {

    constructor(
        private readonly adminService: AdminService
    ) {}

    @Get('dashboard')
    async getDashboardStats() {
        return await this.adminService.getDashboardStats();
    }
}
