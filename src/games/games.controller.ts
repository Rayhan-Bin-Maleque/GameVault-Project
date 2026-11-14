import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { UpdateGameStatusDto } from './dto/update-game-status.dto.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('create-games')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new game',
    description: 'Allows an authenticated Publisher to create a new game.',
  })
  @ApiBody({
    type: CreateGameDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid game information or category IDs.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Publisher access required.',
  })
  @ApiResponse({
    status: 409,
    description: 'A game with this title already exists.',
  })
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; game: GameResponse }> {
    return await this.gamesService.createGame(createGameDto, req.user.id);
  }

  @Get('public/findAllGames')
  @ApiOperation({
    summary: 'Get All public games',
    description: 'Returns all active games available in the public catalogue.',
  })
  @ApiResponse({
    status: 200,
    description: 'Public games retrieved successfully.',
  })
  async findAllPublicGames(): Promise<{
    message: string;
    games: PublicGameReponse[];
  }> {
    return this.gamesService.findAllPublicGames();
  }

  @Get('public/findById/:id')
  @ApiOperation({
    summary: 'Get public game by ID',
    description: 'Returns details of a specific active game.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the game',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Game retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found or inactive.',
  })
  async findPublicGamesById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string; game: PublicGameReponse }> {
    return this.gamesService.findPublicGameById(id);
  }

  @Get('findAllGames')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all publisher games',
    description:
      'Returns all games belonging to the authenticated Publisher, including active and inactive games.',
  })
  @ApiResponse({
    status: 200,
    description: 'Publisher games retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Publisher access required.',
  })
  async findAllGames(
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; games: GameResponse[] }> {
    return this.gamesService.findAllGames(req.user.id);
  }

  @Get('findById/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get publisher game by ID',
    description:
      'Returns a game belonging to the authenticated Publisher. Publishers cannot access another Publisher’s private game records.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the game',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Game retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Publisher access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found or not owned by the Publisher.',
  })
  async findOneGame(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; game: GameResponse }> {
    return this.gamesService.findOneGame(id, req.user.id);
  }

  @Patch('updateGame/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a publisher game',
    description:
      'Updates permitted game information. Only the owning Publisher can update the game.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the game',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    type: PartialUpdateGameDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Game updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID, game information or category IDs.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Publisher access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found or not owned by the Publisher.',
  })
  @ApiResponse({
    status: 409,
    description: 'A game with this title already exists.',
  })
  async updateGame(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateGameDto: PartialUpdateGameDto,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; game: GameResponse }> {
    return this.gamesService.updateGame(id, updateGameDto, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PUBLISHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Activate or deactivate a game',
    description:
      'Allows the owning Publisher to manage game availability. Inactive games are hidden from the public catalogue.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the game',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateGameStatusDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Game status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID or status value.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Publisher access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found or not owned by the Publisher.',
  })
  async updateGameStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() updateStatus: UpdateGameStatusDto,
    @Req() req: { user: { id: string } },
  ): Promise<{ message: string; game: GameResponse }> {
    return this.gamesService.updateGameStatus(
      id,
      req.user.id,
      updateStatus.isActive,
    );
  }

  // @Delete('deleteGame/:id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.PUBLISHER)
  // async deleteGame(
  //   @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  //   @Req() req: { user: { id: string } },
  // ): Promise<{ message: string }> {
  //   return this.gamesService.deleteGame(id, req.user.id);
  // }
}
