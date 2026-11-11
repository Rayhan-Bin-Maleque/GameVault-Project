import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity.js';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentMethod {
  SIMULATED = 'simulated',
}

@Entity('payments')
@Index('IDX_payments_orderId_unique', ['orderId'], {
  unique: true,
})
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentMethod.SIMULATED,
  })
  method: PaymentMethod;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  amount: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  transactionReference: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

