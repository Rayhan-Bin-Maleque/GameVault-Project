
import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Games } from '../games/entities/game.entity.js';
import { Cart } from '../cart/entities/cart.entity.js';
import { CartItem } from '../cart/entities/cart-item.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { Review } from '../reviews/entities/review.entity.js';

import { SupportTicket } from '../support/entities/support-ticket.entity.js';
import { SupportMessage } from '../support/entities/support-message.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [
    User,
    Category,
    Games,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    Review,
    SupportTicket,
    SupportMessage,
  ],

  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
  logging: true,
});
