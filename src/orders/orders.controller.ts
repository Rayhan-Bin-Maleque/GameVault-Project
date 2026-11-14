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

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

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

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @Get('checkout-preview')
  @ApiOperation({
    summary: 'Preview customer checkout',
    description:
      'Calculates cart totals using current database game prices.',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout preview generated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Empty cart or invalid cart data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async getCheckoutPreview(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.getCheckoutPreview(req.user.id);
  }

  @Post('checkout')
  @ApiOperation({
    summary: 'Create order from cart',
    description:
      'Validates games and prices, creates an order and its items, and clears the cart in one database transaction.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Empty cart, inactive game or invalid data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async checkout(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.checkout(req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get customer order history',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer orders retrieved.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async getMyOrders(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Get individual customer order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found or not owned by customer.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async getOrderById(
    @Req() req: AuthenticatedRequest,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.ordersService.getOrderById(
      req.user.id,
      orderId,
    );
  }

  @Patch(':orderId/cancel')
  @ApiOperation({
    summary: 'Cancel a pending order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Order cannot be cancelled.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async cancelOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.ordersService.cancelOrder(
      req.user.id,
      orderId,
    );
  }
}

