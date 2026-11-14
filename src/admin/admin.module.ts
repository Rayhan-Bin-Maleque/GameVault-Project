
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

import { User } from '../users/entities/user.entity.js';
import { Category } from '../categories/entities/category.entity.js';

import { SupportModule } from '../support/support.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category]),
    SupportModule,
  ],

  controllers: [
    AdminController,
  ],

  providers: [
    AdminService,
  ],
})
export class AdminModule {}
