
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

import { AdminService } from './admin.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { UpdateStaffDto } from './dto/update-staff.dto.js';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto.js';

import { SupportService } from '../support/support.service.js';
import { AssignTicketDto } from '../support/dto/assign-ticket.dto.js';


interface AuthenticatedAdminRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {

  constructor(
    private readonly adminService: AdminService,

    private readonly supportService: SupportService,
  ) {}



  @Get('dashboard')
  async getDashboardStats() {
    return await this.adminService.getDashboardStats();
  }



  @Get('staff')
  async getAllStaff() {
    return await this.adminService.getAllStaff();
  }



  @Get('staff/:id')
  async getStaffById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.adminService.getStaffById(id);
  }



  @Patch('staff/:id')
  async updateStaff(
    @Param('id', ParseUUIDPipe) id: string,
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




  @Get('support/tickets')
  async getAllSupportTickets(
    @Req() req: AuthenticatedAdminRequest,
  ) {
    return await this.supportService.getAllTickets(
      req.user.id,
    );
  }


  @Patch('support/tickets/:id/assign')
  async assignSupportTicket(
    @Req() req: AuthenticatedAdminRequest,

    @Param('id', ParseUUIDPipe)
    ticketId: string,

    @Body()
    assignTicketDto: AssignTicketDto,
  ) {
    return await this.supportService.assignTicket(
      req.user.id,
      ticketId,
      assignTicketDto,
    );
  }


  @Get('support/dashboard')
  async getSupportDashboard(
    @Req() req: AuthenticatedAdminRequest,
  ) {
    return await this.supportService.getAdminDashboard(
      req.user.id,
    );
  }
}
