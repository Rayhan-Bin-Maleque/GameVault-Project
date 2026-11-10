import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import type { Request } from 'express';

import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';


interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Get()
  async getMyCart(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cartService.getOrCreateCart(
      req.user.id,
    );
  }

  @Post('items')
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
    return this.cartService.addToCart(
      req.user.id,
      dto,
    );
  }

  @Patch('items/:itemId')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateCartItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', new ParseUUIDPipe())
    itemId: string,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    return this.cartService.updateCartItemQuantity(
      req.user.id,
      itemId,
      dto,
    );
  }

}

