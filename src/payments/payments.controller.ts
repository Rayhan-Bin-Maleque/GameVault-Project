import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import type { Request } from 'express';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create simulated payment',
    description:
      'Creates a pending payment using the owned order amount from the database.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order state or duplicate payment.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async createPayment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(
      req.user.id,
      dto,
    );
  }

  @Post(':paymentId/complete')
  @ApiOperation({
    summary: 'Complete simulated payment',
    description:
      'Completes an eligible simulated payment and confirms its order.',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment UUID',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Simulated payment completed.',
  })
  @ApiResponse({
    status: 400,
    description: 'Payment cannot be completed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async completePayment(
    @Req() req: AuthenticatedRequest,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.paymentsService.completePayment(
      req.user.id,
      paymentId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get customer payment history',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async getMyPayments(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.getMyPayments(req.user.id);
  }

  @Get(':paymentId')
  @ApiOperation({
    summary: 'Get individual customer payment',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async getMyPaymentById(
    @Req() req: AuthenticatedRequest,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.paymentsService.getMyPaymentById(
      req.user.id,
      paymentId,
    );
  }
}
