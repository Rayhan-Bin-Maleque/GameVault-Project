
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SupportController } from './support.controller.js';
import { SupportService } from './support.service.js';

import { SupportTicket } from './entities/support-ticket.entity.js';
import { SupportMessage } from './entities/support-message.entity.js';

import { User } from '../users/entities/user.entity.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupportTicket,
      SupportMessage,
      User,
    ]),
  ],

  controllers: [
    SupportController,
  ],

  providers: [
    SupportService,
    JwtAuthGuard,
    RolesGuard,
  ],

  exports: [
    SupportService,
  ],
})
export class SupportModule {}
