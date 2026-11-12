
import {
    Controller,
    Get,
    UseGuards,
    Param,
    ParseUUIDPipe,
} from '@nestjs/common';

import { AdminService } from './admin.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto.js';

import {Patch,Body,} from '@nestjs/common';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {

    constructor(
        private readonly adminService: AdminService
    ) {}

    // ADMIN DASHBOARD

    @Get('dashboard')
    async getDashboardStats() {
        return await this.adminService.getDashboardStats();
    }

    // VIEW ALL STAFF

    @Get('staff')
    async getAllStaff() {
        return await this.adminService.getAllStaff();
    }

    // VIEW SINGLE STAFF MEMBER

    @Get('staff/:id')
    async getStaffById(
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return await this.adminService.getStaffById(id);
    }


@Patch('staff/:id')
async updateStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() staffData: UpdateStaffDto,
) {
    return this.adminService.updateStaff(
        id,
        staffData,
    );
}


       
@Patch('staff/:id/status')
async updateStaffStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusData: UpdateStaffStatusDto,
) {
    return this.adminService.updateStaffStatus(
        id,
        statusData.isActive,
    );
}


}
