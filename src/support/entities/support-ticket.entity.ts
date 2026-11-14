
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({
    description: 'Unique UUID of the support ticket.',
    format: 'uuid',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique support ticket reference number.',
    example: 'GV-2026-A1B2C3D4',
    maxLength: 30,
    readOnly: true,
  })
  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  ticketNumber: string;

  @ApiProperty({
    description: 'Subject of the support ticket.',
    example: 'Unable to access purchased game',
    maxLength: 200,
  })
  @Column({
    type: 'varchar',
    length: 200,
  })
  subject: string;

  @ApiProperty({
    description: 'Detailed description of the customer issue.',
    example: 'Payment completed but the purchased game is not showing in my library.',
  })
  @Column({
    type: 'text',
  })
  description: string;

  @ApiProperty({
    description: 'Category of the support issue.',
    enum: TicketCategory,
    example: TicketCategory.GAME,
  })
  @Column({
    type: 'enum',
    enum: TicketCategory,
    enumName: 'support_tickets_category_enum',
  })
  category: TicketCategory;

  @ApiProperty({
    description: 'Priority level of the support ticket.',
    enum: TicketPriority,
    example: TicketPriority.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: TicketPriority,
    enumName: 'support_tickets_priority_enum',
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @ApiProperty({
    description: 'Current status of the support ticket.',
    enum: TicketStatus,
    example: TicketStatus.OPEN,
  })
  @Column({
    type: 'enum',
    enum: TicketStatus,
    enumName: 'support_tickets_status_enum',
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  // Customer who created the ticket

  @ApiProperty({
    description: 'Customer account associated with this ticket.',
    type: () => User,
  })
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer: Relation<User>;

  // Support Agent assigned to the ticket

  @ApiPropertyOptional({
    description: 'Support agent assigned to this ticket. Null when the ticket is unassigned.',
    type: () => User,
    nullable: true,
  })
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: Relation<User> | null;

  @ApiProperty({
    description: 'Date and time when the ticket was created.',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the ticket was last updated.',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Date and time when the ticket was resolved.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  resolvedAt: Date | null;

  // Customer reopening request timestamp

  @ApiPropertyOptional({
    description: 'Timestamp when the customer submitted the existing reopening request.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  reopenRequestedAt: Date | null;
}
