
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity.js';
import type { Relation } from 'typeorm';

// Ticket Categories
export enum TicketCategory {
  ACCOUNT = 'ACCOUNT',
  PAYMENT = 'PAYMENT',
  ORDER = 'ORDER',
  GAME = 'GAME',
  TECHNICAL = 'TECHNICAL',
  REFUND = 'REFUND',
  OTHER = 'OTHER',
}

// Ticket Priorities
export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Ticket Status
export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  ticketNumber: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  subject: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketCategory,
    enumName: 'support_tickets_category_enum',
  })
  category: TicketCategory;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    enumName: 'support_tickets_priority_enum',
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    enumName: 'support_tickets_status_enum',
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  // Customer who created the ticket
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer: Relation<User>;

  // Support Agent assigned to the ticket
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: Relation<User> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  resolvedAt: Date | null;

  
    // Customer reopening request timestamp
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  reopenRequestedAt: Date | null;
}
