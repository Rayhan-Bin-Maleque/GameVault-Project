import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  Order,
  OrderStatus,
} from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { Cart } from '../cart/entities/cart.entity.js';
import { CartItem } from '../cart/entities/cart-item.entity.js';
import { Games } from '../games/entities/game.entity.js';
import { User } from '../users/entities/user.entity.js';

export interface PricedCartItem {
  cartItemId: string;
  gameId: string;
  gameName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Games)
    private readonly gameRepository: Repository<Games>,

    private readonly dataSource: DataSource,
  ) {}


  private priceToCents(value: string | number): number {
    const price = String(value);

    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      throw new BadRequestException('Invalid game price');
    }

    const [whole, decimal = ''] = price.split('.');
    const cents =
      Number(whole) * 100 +
      Number(decimal.padEnd(2, '0'));

    if (!Number.isSafeInteger(cents)) {
      throw new BadRequestException('Game price is too large');
    }

    return cents;
  }

  private formatMoney(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  private async calculateCart(
    cartItems: CartItem[],
    gameRepository: Repository<Games>,
    lockGames = false,
  ) {
    const items: PricedCartItem[] = [];
    let totalCents = 0;
    let totalQuantity = 0;

    const maxCents = 999_999_999_999;

    for (const item of cartItems) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new BadRequestException(
          'Cart contains an invalid quantity',
        );
      }

      const game = await gameRepository.findOne({
        where: { id: item.gameId },
        ...(lockGames
          ? { lock: { mode: 'pessimistic_read' as const } }
          : {}),
      });

      if (!game) {
        throw new NotFoundException(
          `Game ${item.gameId} not found`,
        );
      }

      if (!game.isActive) {
        throw new BadRequestException(
          `Game "${game.title}" is not available`,
        );
      }

      const unitPriceCents = this.priceToCents(
        game.price,
      );

      const subtotalCents =
        unitPriceCents * item.quantity;

      if (
        !Number.isSafeInteger(subtotalCents) ||
        subtotalCents > maxCents
      ) {
        throw new BadRequestException(
          'Cart item subtotal exceeds the allowed amount',
        );
      }

      totalCents += subtotalCents;
      totalQuantity += item.quantity;

      if (
        !Number.isSafeInteger(totalCents) ||
        totalCents > maxCents
      ) {
        throw new BadRequestException(
          'Order total exceeds the allowed amount',
        );
      }

      items.push({
        cartItemId: item.id,
        gameId: game.id,
        gameName: game.title,
        quantity: item.quantity,
        unitPrice: this.formatMoney(unitPriceCents),
        subtotal: this.formatMoney(subtotalCents),
      });
    }

    return {
      items,
      totalQuantity,
      totalAmount: this.formatMoney(totalCents),
    };
  }

  // GET /orders/checkout-preview
  async getCheckoutPreview(customerId: string) {
    const cart = await this.cartRepository.findOne({
      where: {
        customer: { id: customerId },
      },
    });

    if (!cart) {
      throw new BadRequestException(
        'Your cart is empty',
      );
    }

    const cartItems = await this.cartItemRepository.find({
      where: {
        cart: { id: cart.id },
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

    const calculated = await this.calculateCart(
      cartItems,
      this.gameRepository,
    );

    return {
      message: 'Checkout preview generated successfully',
      cartId: cart.id,
      totalItems: calculated.items.length,
      totalQuantity: calculated.totalQuantity,
      items: calculated.items,
      totalAmount: calculated.totalAmount,
      canCheckout: true,
    };
  }


  async checkout(customerId: string) {
    return this.dataSource.transaction(
      'READ COMMITTED',
      async (manager) => {
        const cartRepository = manager.getRepository(Cart);
        const cartItemRepository =
          manager.getRepository(CartItem);
        const gameRepository =
          manager.getRepository(Games);
        const orderRepository =
          manager.getRepository(Order);
        const orderItemRepository =
          manager.getRepository(OrderItem);

        const cart = await cartRepository
          .createQueryBuilder('cart')
          .innerJoin('cart.customer', 'customer')
          .where('customer.id = :customerId', {
            customerId,
          })
          .setLock(
            'pessimistic_write',
            undefined,
            ['cart'],
          )
          .getOne();

        if (!cart) {
          throw new BadRequestException(
            'Your cart is empty',
          );
        }

        const cartItems = await cartItemRepository.find({
          where: {
            cart: { id: cart.id },
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

        const calculated = await this.calculateCart(
          cartItems,
          gameRepository,
          true,
        );

        const order = orderRepository.create({
          customer: { id: customerId } as User,
          status: OrderStatus.PENDING,
          totalAmount: calculated.totalAmount,
        });

        const savedOrder =
          await orderRepository.save(order);

        const orderItems = calculated.items.map(
          (item) =>
            orderItemRepository.create({
              order: savedOrder,
              gameId: item.gameId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            }),
        );

        await orderItemRepository.save(orderItems);

        await cartItemRepository.remove(cartItems);

        return {
          message: 'Order created successfully',
          order: {
            id: savedOrder.id,
            status: savedOrder.status,
            totalAmount: savedOrder.totalAmount,
            items: calculated.items.map((item) => ({
              gameId: item.gameId,
              gameName: item.gameName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        };
      },
    );
  }

  async getMyOrders(
    customerId: string,
  ): Promise<Order[]> {
    return this.orderRepository.find({
      where: {
        customer: { id: customerId },
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
        customer: { id: customerId },
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
        customer: { id: customerId },
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

