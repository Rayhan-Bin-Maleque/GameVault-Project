import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
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
  async completePayment(
    @Req() req: AuthenticatedRequest,
    @Param('paymentId', ParseUUIDPipe)
    paymentId: string,
  ) {
    return this.paymentsService.completePayment(
      req.user.id,
      paymentId,
    );
  }

  @Get()
  async getMyPayments(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.getMyPayments(
      req.user.id,
    );
  }

  @Get(':paymentId')
  async getMyPaymentById(
    @Req() req: AuthenticatedRequest,
    @Param('paymentId', ParseUUIDPipe)
    paymentId: string,
  ) {
    return this.paymentsService.getMyPaymentById(
      req.user.id,
      paymentId,
    );
  }
}
