
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async getOrCreateCart(customerId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: {
        customer: {
          id: customerId,
        },
      },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        customer: { id: customerId } as User,
      });

      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }
}

