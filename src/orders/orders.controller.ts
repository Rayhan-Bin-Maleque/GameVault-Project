
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}


  @Get('checkout-preview')
  async getCheckoutPreview(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.getCheckoutPreview(
      req.user.id,
    );
  }


  @Post('checkout')
  async checkout(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.checkout(
      req.user.id,
    );
  }

  @Get()
  async getMyOrders(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.getMyOrders(
      req.user.id,
    );
  }

  @Get(':orderId')
  async getOrderById(
    @Req() req: AuthenticatedRequest,
    @Param('orderId', new ParseUUIDPipe())
    orderId: string,
  ) {
    return this.ordersService.getOrderById(
      req.user.id,
      orderId,
    );
  }

  @Patch(':orderId/cancel')
  async cancelOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId', new ParseUUIDPipe())
    orderId: string,
  ) {
    return this.ordersService.cancelOrder(
      req.user.id,
      orderId,
    );
  }
}

