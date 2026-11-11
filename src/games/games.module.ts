import { Module } from '@nestjs/common';
import { GamesService } from './games.service.js';
import { GamesController } from './games.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from './entities/game.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Games, Category]), AuthModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
