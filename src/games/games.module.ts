import { Module } from '@nestjs/common';
import { GamesService } from './games.service.js';
import { GamesController } from './games.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from './entities/game.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { User } from '../users/entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Games, Category, User]), AuthModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
