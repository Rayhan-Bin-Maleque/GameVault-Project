import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity.js';
import { CartItem } from './entities/cart-item.entity.js';
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
    const cart = await this.getOrCreateCart(customerId);

    const quantity = dto.quantity ?? 1;

    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        gameId: dto.gameId,
      },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
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
          customer: {
            id: customerId,
          },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = dto.quantity;

    return this.cartItemRepository.save(cartItem);
  }
}




