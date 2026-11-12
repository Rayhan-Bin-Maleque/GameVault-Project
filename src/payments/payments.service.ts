
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Payment,
  PaymentStatus,
  PaymentMethod,
} from './entities/payment.entity.js';

import {
  Order,
  OrderStatus,
} from '../orders/entities/order.entity.js';

import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // Create a pending simulated payment
  async createPayment(
    customerId: string,
    dto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentRepository.manager.transaction(
      async (manager) => {
        const orderRepository =
          manager.getRepository(Order);

        const paymentRepository =
          manager.getRepository(Payment);

        const order = await orderRepository
          .createQueryBuilder('o')
          .innerJoin('o.customer', 'customer')
          .where('o.id = :orderId', {
            orderId: dto.orderId,
          })
          .andWhere('customer.id = :customerId', {
            customerId,
          })
          .setLock(
            'pessimistic_write',
            undefined,
            ['o'],
          )
          .getOne();

        if (!order) {
          throw new NotFoundException(
            'Order not found',
          );
        }

        if (order.status !== OrderStatus.PENDING) {
          throw new BadRequestException(
            'Payment cannot be started for this order',
          );
        }

        const amount = Number(order.totalAmount);

        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          throw new BadRequestException(
            'Order total must be greater than zero',
          );
        }

        const existingPayment =
          await paymentRepository.findOne({
            where: {
              orderId: order.id,
            },
          });

        if (existingPayment) {
          throw new ConflictException(
            'Payment already exists for this order',
          );
        }

        const payment = paymentRepository.create({
          orderId: order.id,
          amount: order.totalAmount,
          method: PaymentMethod.SIMULATED,
          status: PaymentStatus.PENDING,
          transactionReference: null,
        });

        return paymentRepository.save(payment);
      },
    );
  }

  // Complete a simulated payment
  async completePayment(
    customerId: string,
    paymentId: string,
  ) {
    return this.paymentRepository.manager.transaction(
      async (manager) => {
        const orderRepository =
          manager.getRepository(Order);

        const paymentRepository =
          manager.getRepository(Payment);

        const existingPayment =
          await paymentRepository.findOne({
            where: {
              id: paymentId,
            },
          });

        if (!existingPayment) {
          throw new NotFoundException(
            'Payment not found',
          );
        }

        const order = await orderRepository
          .createQueryBuilder('o')
          .innerJoin('o.customer', 'customer')
          .where('o.id = :orderId', {
            orderId: existingPayment.orderId,
          })
          .andWhere('customer.id = :customerId', {
            customerId,
          })
          .setLock(
            'pessimistic_write',
            undefined,
            ['o'],
          )
          .getOne();

        if (!order) {
          throw new NotFoundException(
            'Payment not found',
          );
        }

        const payment = await paymentRepository
          .createQueryBuilder('payment')
          .where('payment.id = :paymentId', {
            paymentId,
          })
          .andWhere('payment.orderId = :orderId', {
            orderId: order.id,
          })
          .setLock('pessimistic_write')
          .getOne();

        if (!payment) {
          throw new NotFoundException(
            'Payment not found',
          );
        }

        if (payment.status !== PaymentStatus.PENDING) {
          throw new ConflictException(
            'Payment is not pending',
          );
        }

        if (order.status !== OrderStatus.PENDING) {
          throw new BadRequestException(
            'Order is not pending',
          );
        }

        if (payment.method !== PaymentMethod.SIMULATED) {
          throw new BadRequestException(
            'Unsupported payment method',
          );
        }

        if (payment.amount !== order.totalAmount) {
          throw new BadRequestException(
            'Payment amount does not match order total',
          );
        }

        payment.status = PaymentStatus.COMPLETED;

        payment.transactionReference =
          `SIM-${randomUUID()}`;

        order.status = OrderStatus.CONFIRMED;

        await orderRepository.save(order);
        const savedPayment =
          await paymentRepository.save(payment);

        return {
          message: 'Simulated payment completed successfully',
          payment: savedPayment,
          order: {
            id: order.id,
            status: order.status,
          },
        };
      },
    );
  }

  // Get customer's payments
  async getMyPayments(
    customerId: string,
  ): Promise<Payment[]> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'o')
      .innerJoin('o.customer', 'customer')
      .where('customer.id = :customerId', {
        customerId,
      })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }

  // Get a single payment
  async getMyPaymentById(
    customerId: string,
    paymentId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'o')
      .innerJoin('o.customer', 'customer')
      .where('payment.id = :paymentId', {
        paymentId,
      })
      .andWhere('customer.id = :customerId', {
        customerId,
      })
      .getOne();

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    return payment;
  }
}

