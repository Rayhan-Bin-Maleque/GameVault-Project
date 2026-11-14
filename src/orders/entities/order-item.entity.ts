import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { Order } from './order.entity.js';
import { Games } from '../../games/entities/game.entity.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Relation<Order>;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Games, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'gameId',
    referencedColumnName: 'id',
  })
  game: Relation<Games>;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitPrice: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal: string;

  @CreateDateColumn()
  createdAt: Date;
}
