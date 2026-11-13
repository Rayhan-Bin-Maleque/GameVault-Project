
import {Controller,Get,UseGuards,Param,ParseUUIDPipe,Patch,Body,} from '@nestjs/common';

import {ApiTags,ApiBearerAuth,ApiOperation,ApiResponse,ApiParam,} from '@nestjs/swagger';

import { AdminService } from './admin.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { UpdateStaffDto } from './dto/update-staff.dto.js';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto.js';
 

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {

    constructor(
        private readonly adminService: AdminService,
    ) {}

    

    @Get('dashboard')
    @ApiOperation({
        summary: 'Get admin dashboard statistics',
        description: 'Returns overview statistics for the GameVault administration dashboard.',
    })
    @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized - JWT token is missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
    async getDashboardStats() {
        return await this.adminService.getDashboardStats();
    }

    

    @Get('staff')
    @ApiOperation({
        summary: 'Get all staff members',
        description: 'Returns the staff accounts managed by the administrator.',
    })
    @ApiResponse({ status: 200, description: 'Staff list retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Admin access required.' })
    async getAllStaff() {
        return await this.adminService.getAllStaff();
    }

    

    @Get('staff/:id')
    @ApiOperation({
        summary: 'Get a staff member by ID',
        description: 'Returns details of a specific staff account.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the staff member',
        type: String,
    })
    @ApiResponse({ status: 200, description: 'Staff member retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID.' })
    @ApiResponse({ status: 404, description: 'Staff member not found.' })
    async getStaffById(
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return await this.adminService.getStaffById(id);
    }

    

    @Patch('staff/:id')
    @ApiOperation({
        summary: 'Update staff details',
        description: 'Allows an administrator to update an existing staff member.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the staff member',
        type: String,
    })
    @ApiResponse({ status: 200, description: 'Staff updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID or request body.' })
    @ApiResponse({ status: 404, description: 'Staff member not found.' })
    async updateStaff(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() staffData: UpdateStaffDto,
    ) {
        return this.adminService.updateStaff(id, staffData);
    }

    

    @Patch('staff/:id/status')
    @ApiOperation({
        summary: 'Update staff account status',
        description: 'Allows an administrator to activate or deactivate a staff account.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the staff member',
        type: String,
    })
    @ApiResponse({ status: 200, description: 'Staff status updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID or request body.' })
    @ApiResponse({ status: 404, description: 'Staff member not found.' })
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
