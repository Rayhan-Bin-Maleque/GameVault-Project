import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { Games } from './entities/game.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { CreateGameDto } from './dto/create-game.dto.js';
import { User } from '../users/entities/user.entity.js';
import { GameResponse } from './interfaces/game-response.interface.js';
import { PartialUpdateGameDto } from './dto/partial-update-game.dto.js';
import { PublicGameReponse } from './interfaces/public-game-response.interface.js';
import { resourceLimits } from 'worker_threads';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Games)
    private readonly gamesRepository: Repository<Games>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersReposisory: Repository<User>,
  ) {}

  private async getPublisherName(publisherId: string) {
    const publisher = await this.usersReposisory.findOne({
      where: {
        id: publisherId,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (!publisher) {
      throw new NotFoundException('Publisher account was not found');
    }
    const fullName = publisher.fullName?.trim();

    if (!fullName) {
      throw new InternalServerErrorException(
        'Publisher name is not configured',
      );
    }

    return fullName;
  }

  private toGameResponse(game: Games, publisherName: string): GameResponse {
    return {
      id: game.id,
      title: game.title,
      description: game.title,
      price: game.price,
      imageUrl: game.imageUrl,
      releaseDate: game.releaseDate,
      isActive: game.isActive,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      categories: (game.categories ?? []).map((category) => category.name),
      publisher: {
        publisherName: publisherName,
      },
    };
  }

  private toPublicGameResponse(game: Games): PublicGameReponse {
    const publisherName = game.publisher?.fullName?.trim();

    if (!publisherName) {
      throw new InternalServerErrorException(
        'Unable to retrieve publisher name',
      );
    }
    return {
      id: game.id,
      title: game.title,
      description: game.description,
      price: game.price,
      imageUrl: game.imageUrl,
      releaseDate: game.releaseDate,
      categories: (game.categories ?? []).map((category) => category.name),
      publisher: {
        publisherName: publisherName,
      },
    };
  }

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

      const publisherName = await this.getPublisherName(publisherId);

      const game = this.gamesRepository.create({
        ...gameData,
        releaseDate: new Date(gameData.releaseDate),
        publisher: { id: publisherId } as User,
        categories,
        isActive: true,
      });

      const savedGame = await this.gamesRepository.save(game);

      const result = this.toGameResponse(savedGame, publisherName);

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

  async findAllPublicGames(): Promise<{
    message: string;
    games: PublicGameReponse[];
  }> {
    try {
      const games = await this.gamesRepository.find({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageUrl: true,
          releaseDate: true,
          createdAt: true,

          categories: {
            name: true,
          },

          publisher: {
            fullName: true,
          },
        },
        relations: {
          categories: true,
          publisher: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      const result: PublicGameReponse[] = games.map((game) =>
        this.toPublicGameResponse(game),
      );

      return {
        message: 'Game retrieved successfully',
        games: result,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occured while retriving games',
      );
    }
  }

  async findPublicGameById(
    id: string,
  ): Promise<{ message: string; game: PublicGameReponse }> {
    try {
      const game = await this.gamesRepository.findOne({
        where: {
          id,
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageUrl: true,
          releaseDate: true,
          categories: {
            name: true,
          },
          publisher: {
            fullName: true,
          },
        },
        relations: {
          categories: true,
          publisher: true,
        },
      });

      if (!game) {
        throw new NotFoundException(`Game with id ${id} was not found`);
      }

      const result = this.toPublicGameResponse(game);

      return {
        message: 'Game retrieved successfully',
        game: result,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occured while retrieving the game',
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

      const publisherName = await this.getPublisherName(publisherId);

      const result: GameResponse[] = games.map((game) =>
        this.toGameResponse(game, publisherName),
      );

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

      const publisherName = await this.getPublisherName(publisherId);

      const result = this.toGameResponse(game, publisherName);
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

      const publisherName = await this.getPublisherName(publisherId);

      const result = this.toGameResponse(updatedGame, publisherName);
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
