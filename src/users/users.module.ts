import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [UsersController],
    providers: [UsersService,JwtAuthGuard, RolesGuard],
    exports: [UsersService],
})
export class UsersModule {}