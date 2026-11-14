
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

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { SupportService } from './support.service.js';

import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto.js';
import { UpdateTicketPriorityDto } from './dto/update-ticket-priority.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { SupportTicket } from './entities/support-ticket.entity.js';
import { SupportMessage } from './entities/support-message.entity.js';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@ApiTags('Support')
@ApiBearerAuth('JWT-auth')
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) {}

  // =====================================
  // CUSTOMER SUPPORT MANAGEMENT
  // =====================================

  // 1. CREATE SUPPORT TICKET

  @Post('tickets')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Create a support ticket',
    description:
      'Allows an authenticated customer to submit a new support ticket.',
  })
  @ApiResponse({
    status: 201,
    description: 'Support ticket created successfully.',
    type: SupportTicket,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only active customers can create support tickets.',
  })
  createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(
      req.user.id,
      createTicketDto,
    );
  }

  // 2. VIEW CUSTOMER TICKETS

  @Get('my-tickets')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get my support tickets',
    description:
      'Returns all support tickets created by the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer support tickets retrieved successfully.',
    type: SupportTicket,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Customer access required.',
  })
  getMyTickets(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportService.getMyTickets(
      req.user.id,
    );
  }

  // 3. VIEW SINGLE CUSTOMER TICKET

  @Get('my-tickets/:id')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get my support ticket by ID',
    description:
      'Returns details of a specific ticket belonging to the authenticated customer.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Support ticket retrieved successfully.',
    type: SupportTicket,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Customer access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Support ticket not found.',
  })
  getMyTicketById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.getMyTicketById(
      req.user.id,
      ticketId,
    );
  }

  // 4. CUSTOMER SEND MESSAGE

  @Post('my-tickets/:id/messages')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Send a message to support',
    description:
      'Allows a customer to send a message within their own support ticket.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer message submitted successfully.',
    type: SupportMessage,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid UUID, message information, or ticket status does not permit new messages.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Customer access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Support ticket not found.',
  })
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

  // 5. VIEW CUSTOMER TICKET MESSAGES

  @Get('my-tickets/:id/messages')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get customer ticket messages',
    description:
      'Returns the conversation history of the authenticated customer’s support ticket.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket messages retrieved successfully.',
    type: SupportMessage,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied.',
  })
  @ApiResponse({
    status: 404,
    description: 'Support ticket not found.',
  })
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

  // 6. REQUEST TICKET REOPENING

  @Post('my-tickets/:id/reopen')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Request ticket reopening',
    description:
      'Allows a customer to submit a reopening request for their own resolved ticket. The current implementation records the reopening request timestamp. It does not directly change the ticket status.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Reopening request submitted successfully.',
    type: SupportTicket,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID or only resolved tickets can be submitted for reopening.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Customer access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Support ticket not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'A reopening request has already been submitted.',
  })
  requestReopenTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.requestReopenTicket(
      req.user.id,
      ticketId,
    );
  }

  // =====================================
  // SUPPORT AGENT MANAGEMENT
  // =====================================

  // 7. VIEW ASSIGNED TICKETS

  @Get('agent/tickets')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get assigned support tickets',
    description:
      'Returns all support tickets assigned to the authenticated support agent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assigned tickets retrieved successfully.',
    type: SupportTicket,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Active support agent access required.',
  })
  getAssignedTickets(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportService.getAssignedTickets(
      req.user.id,
    );
  }

  // 8. VIEW SINGLE ASSIGNED TICKET

  @Get('agent/tickets/:id')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get assigned ticket by ID',
    description:
      'Returns details of a ticket assigned to the authenticated support agent.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Assigned ticket retrieved successfully.',
    type: SupportTicket,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Active support agent access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Assigned support ticket not found.',
  })
  getAssignedTicketById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.getAssignedTicketById(
      req.user.id,
      ticketId,
    );
  }

  // 9. VIEW AGENT TICKET MESSAGES

  @Get('agent/tickets/:id/messages')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get assigned ticket messages',
    description:
      'Returns conversation history for a ticket assigned to the authenticated support agent.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket messages retrieved successfully.',
    type: SupportMessage,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Active support agent access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Assigned support ticket not found.',
  })
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

  // 10. AGENT REPLY TO CUSTOMER

  @Post('agent/tickets/:id/messages')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Reply to customer support ticket',
    description:
      'Allows the assigned support agent to send a reply to the customer within an assigned support ticket.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Support agent reply submitted successfully.',
    type: SupportMessage,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid UUID, message information, or resolved/closed ticket cannot receive replies.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Active support agent access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Assigned support ticket not found.',
  })
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

  // 11. UPDATE TICKET STATUS

  @Patch('agent/tickets/:id/status')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Update support ticket status',
    description:
      'Allows the assigned support agent to update ticket status according to the existing workflow. A resolved ticket cannot be directly reopened through this endpoint. The reopening workflow must be used.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully.',
    type: SupportTicket,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid UUID or requested status transition is not allowed for the ticket’s current state.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Authenticated user must have an active SUPPORT account.',
  })
  @ApiResponse({
    status: 404,
    description: 'Assigned support ticket not found.',
  })
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

  // 12. UPDATE TICKET PRIORITY

  @Patch('agent/tickets/:id/priority')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Update ticket priority',
    description:
      'Allows the assigned support agent to change the priority of an active support ticket.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the support ticket.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket priority updated successfully.',
    type: SupportTicket,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid UUID or priority cannot be changed on a resolved or closed ticket.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Authenticated user must have an active SUPPORT account.',
  })
  @ApiResponse({
    status: 404,
    description: 'Assigned support ticket not found.',
  })
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

  // 13. SUPPORT AGENT DASHBOARD

  @Get('agent/dashboard')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get support agent dashboard',
    description:
      'Returns ticket statistics for the authenticated support agent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Support agent dashboard retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        totalAssigned: {
          type: 'integer',
          example: 12,
        },
        openTickets: {
          type: 'integer',
          example: 2,
        },
        assignedTickets: {
          type: 'integer',
          example: 3,
        },
        inProgressTickets: {
          type: 'integer',
          example: 2,
        },
        waitingForCustomerTickets: {
          type: 'integer',
          example: 1,
        },
        resolvedTickets: {
          type: 'integer',
          example: 3,
        },
        closedTickets: {
          type: 'integer',
          example: 1,
        },
        urgentTickets: {
          type: 'integer',
          example: 2,
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
    description: 'Active support agent access required.',
  })
  getAgentDashboard(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportService.getAgentDashboard(
      req.user.id,
    );
  }
}
