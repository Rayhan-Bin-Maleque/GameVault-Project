import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, QueryFailedError, Repository } from 'typeorm';
import { Games } from './entities/game.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { CreateGameDto } from './dto/create-game.dto.js';
import { User } from '../users/entities/user.entity.js';
import { GameResponse } from './interfaces/game-response.interface.js';
import { getActiveResourcesInfo } from 'process';
import { PartialUpdateGameDto } from './dto/partial-update-game.dto.js';
import { scanInternals } from 'rxjs/internal/operators/scanInternals';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Games)
    private readonly gamesRepository: Repository<Games>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createGame(
    createGameDto: CreateGameDto,
    publisherId: string,
  ): Promise<{ message: string; game: GameResponse }> {
    try {
      const { categoryIds, ...gameData } = createGameDto;
      let categories: Category[] = [];

      if (categoryIds?.length) {
        const uniqueCategoryIds = [...new Set(categoryIds)];
        categories = await this.categoryRepository.find({
          where: {
            id: In(uniqueCategoryIds),
          },
        });

        if (categories.length !== uniqueCategoryIds.length) {
          throw new NotFoundException('One or more categories were not found');
        }
      }

      const game = this.gamesRepository.create({
        ...gameData,
        releaseDate: new Date(gameData.releaseDate),
        publisher: { id: publisherId } as User,
        categories,
      });

      const savedGame = await this.gamesRepository.save(game);

      const result: GameResponse = {
        id: savedGame.id,
        title: savedGame.title,
        description: savedGame.description,
        price: savedGame.price,
        imageUrl: savedGame.imageUrl,
        releaseDate: savedGame.releaseDate,
        isActive: savedGame.isActive,
        createdAt: savedGame.createdAt,
        updatedAt: savedGame.updatedAt,
        categories: savedGame.categories.map((category) => category.name),
      };

      return {
        message: 'Game created successfully',
        game: result,
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          constraint?: string;
        };

        if (driverError.code === '23505') {
          throw new ConflictException('A game with this title already exists');
        }

        if (driverError.code === '23503') {
          throw new NotFoundException(
            'The specified publisher or category does not exist',
          );
        }
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creatign the game',
      );
    }
  }

  async findAllGames(
    publisherId: string,
  ): Promise<{ message: string; games: GameResponse[] }> {
    try {
      const games = await this.gamesRepository.find({
        where: {
          publisher: { id: publisherId },
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageUrl: true,
          releaseDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          categories: {
            name: true,
          },
        },
        relations: {
          categories: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      const result: GameResponse[] = games.map((game) => ({
        id: game.id,
        title: game.title,
        description: game.description,
        price: game.price,
        imageUrl: game.imageUrl,
        releaseDate: game.releaseDate,
        isActive: game.isActive,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        categories: game.categories.map((category) => category.name),
      }));

      return {
        message: 'Games retrieved successfully',
        games: result,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occured while retrieving games',
      );
    }
  }

  async findOneGame(
    id: string,
    publisherId: string,
  ): Promise<{ message: string; game: GameResponse }> {
    try {
      const game = await this.gamesRepository.findOne({
        where: {
          id,
          publisher: { id: publisherId },
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageUrl: true,
          releaseDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          categories: {
            name: true,
          },
        },
        relations: {
          categories: true,
        },
      });

      if (!game) {
        throw new NotFoundException(`Game with id ${id} was not found`);
      }
      const result: GameResponse = {
        id: game.id,
        title: game.title,
        description: game.description,
        price: game.price,
        imageUrl: game.imageUrl,
        releaseDate: game.releaseDate,
        isActive: game.isActive,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        categories: game.categories.map((category) => category.name),
      };

      return {
        message: 'Game retrieved successfully',
        game: result,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occured while retrieving game',
      );
    }
  }

  async updateGame(
    id: string,
    updateGameDto: PartialUpdateGameDto,
    publisherId: string,
  ): Promise<{ message: string; game: GameResponse }> {
    try {
      const game = await this.gamesRepository.findOne({
        where: {
          id,
          publisher: { id: publisherId },
        },
        relations: {
          categories: true,
        },
      });

      if (!game) {
        throw new NotFoundException(`Game with id ${id} not found`);
      }

      const { categoryIds, ...gameData } = updateGameDto;

      Object.assign(game, gameData);

      if (gameData.releaseDate) {
        game.releaseDate = new Date(gameData.releaseDate);
      }

      if (categoryIds !== undefined) {
        const uniqueCategoryIds = [...new Set(categoryIds)];

        const categories = uniqueCategoryIds.length
          ? await this.categoryRepository.find({
              where: {
                id: In(uniqueCategoryIds),
              },
            })
          : [];

        if (categories.length != uniqueCategoryIds.length) {
          throw new NotFoundException('One or more categories were not found');
        }

        game.categories = categories;
      }

      const updatedGame = await this.gamesRepository.save(game);

      const result: GameResponse = {
        id: updatedGame.id,
        title: updatedGame.title,
        description: updatedGame.description,
        price: updatedGame.price,
        imageUrl: updatedGame.imageUrl,
        releaseDate: updatedGame.releaseDate,
        isActive: updatedGame.isActive,
        createdAt: updatedGame.createdAt,
        updatedAt: updatedGame.updatedAt,
        categories: updatedGame.categories.map((category) => category.name),
      };

      return {
        message: 'Game updated successfully',
        game: result,
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
        };

        if (driverError.code === '23505') {
          throw new ConflictException('A game with this title already exists');
        }
        if (driverError.code === '23503') {
          throw new ConflictException(
            'A specified publisher or category does not exist',
          );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occured while updating the game',
      );
    }
  }

  async deleteGame(
    id: string,
    publisherId: string,
  ): Promise<{ message: string }> {
    try {
      const game = await this.gamesRepository.findOne({
        where: {
          id,
          publisher: { id: publisherId },
        },
      });

      if (!game) {
        throw new NotFoundException(`Game with id ${id} not found`);
      }

      await this.gamesRepository.remove(game);

      return {
        message: 'Game permanently deleted successfully',
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occured while permanently deleting the game',
      );
    }
  }
}
