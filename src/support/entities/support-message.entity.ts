
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
import { SupportTicket } from './support-ticket.entity.js';

import type { Relation } from 'typeorm';

@Entity('support_messages')
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Support Ticket

  @ManyToOne(() => SupportTicket, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({ name: 'ticketId' })
  ticket: Relation<SupportTicket>;

  // User who sent the message

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({ name: 'senderId' })
  sender: Relation<User>;

  @Column({
    type: 'text',
  })
  message: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
