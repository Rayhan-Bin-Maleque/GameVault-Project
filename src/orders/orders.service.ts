import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  OrderStatus,
} from './entities/order.entity.js';
import { Cart } from '../cart/entities/cart.entity.js';
import { CartItem } from '../cart/entities/cart-item.entity.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async getCheckoutPreview(customerId: string) {
    const cart = await this.cartRepository.findOne({
      where: {
        customer: {
          id: customerId,
        },
      },
    });

    if (!cart) {
      throw new BadRequestException(
        'Your cart is empty',
      );
    }

    const cartItems = await this.cartItemRepository.find({
      where: {
        cart: {
          id: cart.id,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException(
        'Your cart is empty',
      );
    }

    const totalQuantity = cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    return {
      message: 'Checkout preview generated successfully',
      cartId: cart.id,
      totalItems: cartItems.length,
      totalQuantity,
      items: cartItems.map((item) => ({
        cartItemId: item.id,
        gameId: item.gameId,
        quantity: item.quantity,
      })),
      totalAmount: null,
      canCheckout: false,
      reason: 'Game pricing integration is pending',
    };
  }

  async getMyOrders(
    customerId: string,
  ): Promise<Order[]> {
    return this.orderRepository.find({
      where: {
        customer: {
          id: customerId,
        },
      },
      relations: {
        items: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getOrderById(
    customerId: string,
    orderId: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        customer: {
          id: customerId,
        },
      },
      relations: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(
    customerId: string,
    orderId: string,
  ): Promise<{
    message: string;
    order: Order;
  }> {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        customer: {
          id: customerId,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Only pending orders can be cancelled',
      );
    }

    const result = await this.orderRepository.update(
      {
        id: order.id,
        status: OrderStatus.PENDING,
      },
      {
        status: OrderStatus.CANCELLED,
      },
    );

    if (result.affected !== 1) {
      throw new BadRequestException(
        'Order is no longer pending',
      );
    }

    const cancelledOrder = await this.getOrderById(
      customerId,
      orderId,
    );

    return {
      message: 'Order cancelled successfully',
      order: cancelledOrder,
    };
  }
}

