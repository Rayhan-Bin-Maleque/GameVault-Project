
import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Cart } from '../cart/entities/cart.entity.js';

export const AppDataSource = new DataSource({
    type: 'postgres',

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    entities: [User,Category,Cart],

    migrations: ['src/database/migrations/*.ts'],

    synchronize: false,
    logging: true,
});
