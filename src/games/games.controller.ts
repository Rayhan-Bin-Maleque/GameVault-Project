import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service.js';
import { CreateGameDto } from './dto/create-game.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { PartialUpdateGameDto } from './dto/partial-update-game.dto.js';
import { GameResponse } from './interfaces/game-response.interface.js';
import { PublicGameReponse } from './interfaces/public-game-response.interface.js';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('create-games')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; game: GameResponse }> {
    return await this.gamesService.createGame(createGameDto, req.user.id);
  }

  @Get('public/findAllGames')
  async findAllPublicGames(): Promise<{
    message: string;
    games: PublicGameReponse[];
  }> {
    return this.gamesService.findAllPublicGames();
  }

  @Get('public/findById/:id')
  async findPublicGamesById(
    id: string,
  ): Promise<{ message: string; game: PublicGameReponse }> {
    return this.gamesService.findPublicGameById(id);
  }

  @Get('findAllGames')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  async findAllGames(
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; games: GameResponse[] }> {
    return this.gamesService.findAllGames(req.user.id);
  }

  @Get('findById/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  async findOneGame(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; game: GameResponse }> {
    return this.gamesService.findOneGame(id, req.user.id);
  }

  @Patch('updateGame/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  async updateGame(
    @Param('id') id: string,
    @Body() updateGameDto: PartialUpdateGameDto,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; game: GameResponse }> {
    return this.gamesService.updateGame(id, updateGameDto, req.user.id);
  }

  @Delete('deleteGame/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  async deleteGame(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string }> {
    return this.gamesService.deleteGame(id, req.user.id);
  }
}
