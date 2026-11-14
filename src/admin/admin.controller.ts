
import {
    Controller,
    Get,
    UseGuards,
    Param,
    ParseUUIDPipe,
    Patch,
    Body,
    Req,
} from '@nestjs/common';

import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';

import { AdminService } from './admin.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { UpdateStaffDto } from './dto/update-staff.dto.js';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto.js';

import { SupportService } from '../support/support.service.js';
import { AssignTicketDto } from '../support/dto/assign-ticket.dto.js';

import { SupportTicket } from '../support/entities/support-ticket.entity.js';

// Authenticated Admin Request Interface

interface AuthenticatedAdminRequest {
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
}

// Reusable Swagger Staff Response Schema

const staffProperties = {
    id: {
        type: 'string',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000',
    },
    fullName: {
        type: 'string',
        example: 'GameVault Support',
    },
    email: {
        type: 'string',
        format: 'email',
        example: 'support@gmail.com',
    },
    role: {
        type: 'string',
        enum: [UserRole.PUBLISHER, UserRole.SUPPORT],
        example: UserRole.SUPPORT,
    },
    isActive: {
        type: 'boolean',
        example: true,
    },
    createdAt: {
        type: 'string',
        format: 'date-time',
    },
    updatedAt: {
        type: 'string',
        format: 'date-time',
    },
};

// =====================================
// ADMIN CONTROLLER
// =====================================

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {

    constructor(
        private readonly adminService: AdminService,

        private readonly supportService: SupportService,
    ) {}


    // =====================================
    // ADMIN DASHBOARD
    // =====================================

    @Get('dashboard')
    @ApiOperation({
        summary: 'Get admin dashboard statistics',
        description:
            'Returns an overview of GameVault users, user roles, account activity and category statistics.',
    })
    @ApiResponse({
        status: 200,
        description: 'Dashboard statistics retrieved successfully.',
        schema: {
            type: 'object',
            properties: {
                totalUsers: {
                    type: 'integer',
                    example: 150,
                },
                totalCustomers: {
                    type: 'integer',
                    example: 100,
                },
                totalPublishers: {
                    type: 'integer',
                    example: 20,
                },
                totalSupportAgents: {
                    type: 'integer',
                    example: 15,
                },
                totalAdmins: {
                    type: 'integer',
                    example: 15,
                },
                activeUsers: {
                    type: 'integer',
                    example: 140,
                },
                inactiveUsers: {
                    type: 'integer',
                    example: 10,
                },
                totalCategories: {
                    type: 'integer',
                    example: 12,
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized. Missing or invalid JWT token.',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden. Admin access required.',
    })
    async getDashboardStats() {
        return await this.adminService.getDashboardStats();
    }


    // =====================================
    // STAFF MANAGEMENT
    // =====================================

    // 1. VIEW ALL STAFF

    @Get('staff')
    @ApiOperation({
        summary: 'Get all staff members',
        description:
            'Returns all Publisher and Support staff accounts managed by the administrator.',
    })
    @ApiResponse({
        status: 200,
        description: 'Staff list retrieved successfully.',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Staff retrieved successfully',
                },
                totalStaff: {
                    type: 'integer',
                    example: 10,
                },
                staff: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: staffProperties,
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required.',
    })
    async getAllStaff() {
        return await this.adminService.getAllStaff();
    }


    // 2. VIEW SINGLE STAFF MEMBER

    @Get('staff/:id')
    @ApiOperation({
        summary: 'Get a staff member by ID',
        description:
            'Returns details of a specific Publisher or Support staff account.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the staff member.',
        type: String,
        format: 'uuid',
    })
    @ApiResponse({
        status: 200,
        description: 'Staff member retrieved successfully.',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Staff member retrieved successfully',
                },
                staff: {
                    type: 'object',
                    properties: staffProperties,
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid UUID.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required.',
    })
    @ApiResponse({
        status: 404,
        description: 'Staff member not found.',
    })
    async getStaffById(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return await this.adminService.getStaffById(id);
    }


    // 3. UPDATE STAFF DETAILS

    @Patch('staff/:id')
    @ApiOperation({
        summary: 'Update staff details',
        description:
            'Allows an administrator to update an existing staff member name or email address.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the staff member.',
        type: String,
        format: 'uuid',
    })
    @ApiBody({
        type: UpdateStaffDto,
        description: 'Staff information to update.',
    })
    @ApiResponse({
        status: 200,
        description: 'Staff updated successfully.',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Staff updated successfully',
                },
                staff: {
                    type: 'object',
                    properties: staffProperties,
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid UUID or request body.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required.',
    })
    @ApiResponse({
        status: 404,
        description: 'Staff member not found.',
    })
    @ApiResponse({
        status: 409,
        description: 'Email address is already in use.',
    })
    async updateStaff(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() staffData: UpdateStaffDto,
    ) {
        return this.adminService.updateStaff(
            id,
            staffData,
        );
    }


    // 4. UPDATE STAFF ACCOUNT STATUS

    @Patch('staff/:id/status')
    @ApiOperation({
        summary: 'Update staff account status',
        description:
            'Allows an administrator to activate or deactivate a staff account.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the staff member.',
        type: String,
        format: 'uuid',
    })
    @ApiBody({
        type: UpdateStaffStatusDto,
        description: 'New staff account activation status.',
    })
    @ApiResponse({
        status: 200,
        description: 'Staff status updated successfully.',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Staff account activated successfully',
                },
                staff: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        fullName: {
                            type: 'string',
                            example: 'GameVault Support',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'support@gmail.com',
                        },
                        role: {
                            type: 'string',
                            enum: [
                                UserRole.PUBLISHER,
                                UserRole.SUPPORT,
                            ],
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid UUID or request body.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required.',
    })
    @ApiResponse({
        status: 404,
        description: 'Staff member not found.',
    })
    async updateStaffStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() statusData: UpdateStaffStatusDto,
    ) {
        return this.adminService.updateStaffStatus(
            id,
            statusData.isActive,
        );
    }


    // =====================================
    // ADMIN SUPPORT MANAGEMENT
    // =====================================

    // 5. VIEW ALL SUPPORT TICKETS

    @Get('support/tickets')
    @ApiOperation({
        summary: 'Get all support tickets',
        description:
            'Allows administrators to view all customer support tickets, including assignment, priority and current status.',
    })
    @ApiResponse({
        status: 200,
        description: 'All support tickets retrieved successfully.',
        type: SupportTicket,
        isArray: true,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required.',
    })
    async getAllSupportTickets(
        @Req() req: AuthenticatedAdminRequest,
    ) {
        return await this.supportService.getAllTickets(
            req.user.id,
        );
    }


    // 6. ASSIGN SUPPORT TICKET

    @Patch('support/tickets/:id/assign')
    @ApiOperation({
        summary: 'Assign support ticket to an agent',
        description:
            'Allows an administrator to assign an eligible support ticket to an active support agent.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the support ticket.',
        type: String,
        format: 'uuid',
    })
    @ApiBody({
        type: AssignTicketDto,
        description: 'Support agent assignment information.',
    })
    @ApiResponse({
        status: 200,
        description: 'Support ticket assigned successfully.',
        type: SupportTicket,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid UUID or ticket cannot be assigned.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required.',
    })
    @ApiResponse({
        status: 404,
        description: 'Support ticket or support agent not found.',
    })
    async assignSupportTicket(
        @Req() req: AuthenticatedAdminRequest,
        @Param('id', ParseUUIDPipe) ticketId: string,
        @Body() assignTicketDto: AssignTicketDto,
    ) {
        return await this.supportService.assignTicket(
            req.user.id,
            ticketId,
            assignTicketDto,
        );
    }


    // 7. ADMIN SUPPORT DASHBOARD

    @Get('support/dashboard')
    @ApiOperation({
        summary: 'Get support administration dashboard',
        description:
            'Returns overall support management statistics, including ticket status, priority distribution, assignment statistics and active support agents.',
    })
    @ApiResponse({
        status: 200,
        description: 'Support dashboard statistics retrieved successfully.',
        schema: {
            type: 'object',
            properties: {
                totalTickets: {
                    type: 'integer',
                    example: 100,
                },
                unassignedTickets: {
                    type: 'integer',
                    example: 15,
                },
                assignedTickets: {
                    type: 'integer',
                    example: 85,
                },
                openTickets: {
                    type: 'integer',
                    example: 20,
                },
                assignedStatusTickets: {
                    type: 'integer',
                    example: 15,
                },
                inProgressTickets: {
                    type: 'integer',
                    example: 25,
                },
                waitingForCustomerTickets: {
                    type: 'integer',
                    example: 10,
                },
                resolvedTickets: {
                    type: 'integer',
                    example: 20,
                },
                closedTickets: {
                    type: 'integer',
                    example: 10,
                },
                lowPriorityTickets: {
                    type: 'integer',
                    example: 15,
                },
                mediumPriorityTickets: {
                    type: 'integer',
                    example: 35,
                },
                highPriorityTickets: {
                    type: 'integer',
                    example: 30,
                },
                urgentTickets: {
                    type: 'integer',
                    example: 20,
                },
                activeSupportAgents: {
                    type: 'integer',
                    example: 8,
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required.',
    })
    async getSupportDashboard(
        @Req() req: AuthenticatedAdminRequest,
    ) {
        return await this.supportService.getAdminDashboard(
            req.user.id,
        );
    }

}
