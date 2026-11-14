
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../users/entities/user.entity.js';
import { SupportTicket } from './support-ticket.entity.js';

import type { Relation } from 'typeorm';

@Entity('support_messages')
export class SupportMessage {

  @ApiProperty({
    description: 'Unique UUID of the support message.',
    format: 'uuid',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Support Ticket

  @ApiProperty({
    description: 'Support ticket associated with this message.',
    type: () => SupportTicket,
  })
  @ManyToOne(() => SupportTicket, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({ name: 'ticketId' })
  ticket: Relation<SupportTicket>;

  // User who sent the message

  @ApiProperty({
    description: 'User who sent this support message.',
    type: () => User,
  })
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({ name: 'senderId' })
  sender: Relation<User>;

  @ApiProperty({
    description: 'Content of the support message.',
    example: 'Hello, your issue is currently being investigated.',
  })
  @Column({
    type: 'text',
  })
  message: string;

  @ApiProperty({
    description: 'Date and time when the message was created.',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the message was last updated.',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
