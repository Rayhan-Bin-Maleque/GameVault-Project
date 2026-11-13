import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import type { Request } from 'express';
import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'View customer cart',
    description: 'Returns the authenticated customer cart and items.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async getMyCart(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cartService.getOrCreateCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add game to cart',
    description:
      'Validates the game and adds it to the customer cart. Existing game quantities are increased.',
  })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({
    status: 201,
    description: 'Game added to cart successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid quantity, game UUID or unavailable game.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  @ApiResponse({ status: 404, description: 'Game not found.' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async addToCart(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({
    summary: 'Update cart item quantity',
    description:
      'Updates the quantity of an item belonging to the authenticated customer.',
  })
  @ApiParam({
    name: 'itemId',
    description: 'Cart item UUID',
    type: String,
  })
  @ApiBody({ type: UpdateCartQuantityDto })
  @ApiResponse({
    status: 200,
    description: 'Cart item quantity updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateCartItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    return this.cartService.updateCartItemQuantity(
      req.user.id,
      itemId,
      dto,
    );
  }

  @Delete('items/:itemId')
  @ApiOperation({
    summary: 'Remove individual cart item',
    description:
      'Removes an item belonging to the authenticated customer.',
  })
  @ApiParam({
    name: 'itemId',
    description: 'Cart item UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item removed successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  async removeCartItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ) {
    return this.cartService.removeCartItem(
      req.user.id,
      itemId,
    );
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'Clear customer cart',
    description:
      'Removes all cart items belonging to the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  async clearCart(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cartService.clearCart(req.user.id);
  }
}



