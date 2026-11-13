import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity.js';
import { CartItem } from './entities/cart-item.entity.js';
import { Games } from '../games/entities/game.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto.js';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Games)
    private readonly gameRepository: Repository<Games>,
  ) {}

  async getOrCreateCart(
    customerId: string,
  ): Promise<Cart & { items: CartItem[] }> {
    let cart = await this.cartRepository.findOne({
      where: {
        customer: { id: customerId },
      },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        customer: { id: customerId } as User,
      });

      cart = await this.cartRepository.save(cart);
    }

    const items = await this.cartItemRepository.find({
      where: {
        cart: { id: cart.id },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return Object.assign(cart, { items });
  }

  async addToCart(
    customerId: string,
    dto: AddCartItemDto,
  ): Promise<CartItem> {
    const game = await this.gameRepository.findOne({
      where: { id: dto.gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (!game.isActive) {
      throw new BadRequestException(
        'This game is not available for purchase',
      );
    }

    const cart = await this.getOrCreateCart(customerId);
    const quantity = dto.quantity ?? 1;

    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        gameId: dto.gameId,
      },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;

      if (
        !Number.isSafeInteger(newQuantity) ||
        newQuantity > 2147483647
      ) {
        throw new BadRequestException(
          'Cart quantity exceeds the allowed limit',
        );
      }

      cartItem.quantity = newQuantity;
    } else {
      if (quantity > 2147483647) {
        throw new BadRequestException(
          'Cart quantity exceeds the allowed limit',
        );
      }

      cartItem = this.cartItemRepository.create({
        cart,
        gameId: dto.gameId,
        quantity,
      });
    }

    return this.cartItemRepository.save(cartItem);
  }

  async updateCartItemQuantity(
    customerId: string,
    itemId: string,
    dto: UpdateCartQuantityDto,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: {
          customer: { id: customerId },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity > 2147483647) {
      throw new BadRequestException(
        'Cart quantity exceeds the allowed limit',
      );
    }

    cartItem.quantity = dto.quantity;

    return this.cartItemRepository.save(cartItem);
  }

  async removeCartItem(
    customerId: string,
    itemId: string,
  ) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: {
          customer: { id: customerId },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    return {
      message: 'Cart item removed successfully',
    };
  }

  async clearCart(customerId: string) {
    const cart = await this.cartRepository.findOne({
      where: {
        customer: { id: customerId },
      },
    });

    if (!cart) {
      return {
        message: 'Cart cleared successfully',
        removedItems: 0,
      };
    }

    const items = await this.cartItemRepository.find({
      where: {
        cart: { id: cart.id },
      },
    });

    const removedItems = items.length;

    if (removedItems > 0) {
      await this.cartItemRepository.remove(items);
    }

    return {
      message: 'Cart cleared successfully',
      removedItems,
    };
  }
}




