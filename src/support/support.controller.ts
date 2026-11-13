
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SupportService } from './support.service.js';

import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto.js';
import { UpdateTicketPriorityDto } from './dto/update-ticket-priority.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';


// Authenticated JWT user information


interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) {}

 



  @Post('tickets')
  @Roles(UserRole.CUSTOMER)
  createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(
      req.user.id,
      createTicketDto,
    );
  }

 
  @Get('my-tickets')
  @Roles(UserRole.CUSTOMER)
  getMyTickets(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportService.getMyTickets(
      req.user.id,
    );
  }

  
  @Get('my-tickets/:id')
  @Roles(UserRole.CUSTOMER)
  getMyTicketById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.getMyTicketById(
      req.user.id,
      ticketId,
    );
  }


  @Post('my-tickets/:id/messages')
  @Roles(UserRole.CUSTOMER)
  createCustomerMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.supportService.createCustomerMessage(
      req.user.id,
      ticketId,
      createMessageDto,
    );
  }


  @Get('my-tickets/:id/messages')
  @Roles(UserRole.CUSTOMER)
  getCustomerTicketMessages(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.getTicketMessages(
      req.user.id,
      req.user.role,
      ticketId,
    );
  }

  
  @Post('my-tickets/:id/reopen')
  @Roles(UserRole.CUSTOMER)
  requestReopenTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.requestReopenTicket(
      req.user.id,
      ticketId,
    );
  }




  @Get('agent/tickets')
  @Roles(UserRole.SUPPORT)
  getAssignedTickets(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportService.getAssignedTickets(
      req.user.id,
    );
  }

  

  @Get('agent/tickets/:id')
  @Roles(UserRole.SUPPORT)
  getAssignedTicketById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.getAssignedTicketById(
      req.user.id,
      ticketId,
    );
  }



  @Get('agent/tickets/:id/messages')
  @Roles(UserRole.SUPPORT)
  getAgentTicketMessages(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.getTicketMessages(
      req.user.id,
      req.user.role,
      ticketId,
    );
  }

 

  @Post('agent/tickets/:id/messages')
  @Roles(UserRole.SUPPORT)
  createAgentReply(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.supportService.createAgentReply(
      req.user.id,
      ticketId,
      createMessageDto,
    );
  }

  
  @Patch('agent/tickets/:id/status')
  @Roles(UserRole.SUPPORT)
  updateTicketStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateTicketStatus(
      req.user.id,
      ticketId,
      updateTicketStatusDto,
    );
  }



  @Patch('agent/tickets/:id/priority')
  @Roles(UserRole.SUPPORT)
  updateTicketPriority(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() updateTicketPriorityDto: UpdateTicketPriorityDto,
  ) {
    return this.supportService.updateTicketPriority(
      req.user.id,
      ticketId,
      updateTicketPriorityDto,
    );
  }

  
  @Get('agent/dashboard')
  @Roles(UserRole.SUPPORT)
  getAgentDashboard(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportService.getAgentDashboard(
      req.user.id,
    );
  }
}
