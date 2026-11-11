import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Review } from './entities/review.entity.js';

import { CreateReviewDto } from './dto/create-review.dto.js';

import { UpdateReviewDto } from './dto/update-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  // Create a new review
  async create(
    customerId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const review = this.reviewRepository.create({
      customerId,
      gameId: dto.gameId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    try {
      return await this.reviewRepository.save(review);
    } catch (error: unknown) {
      const dbError = error as {
        code?: string;
        driverError?: { code?: string };
      };

      if (
        dbError.code === '23505' ||
        dbError.driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'You have already reviewed this game',
        );
      }

      throw error;
    }
  }

  async findByGame(
    gameId: string,
  ): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { gameId },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyReviews(
    customerId: string,
  ): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyReviewById(
    id: string,
    customerId: string,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: {
        id,
        customerId,
      },
    });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    return review;
  }

  async update(
    id: string,
    customerId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.findMyReviewById(
      id,
      customerId,
    );

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }

    return this.reviewRepository.save(review);
  }

  async remove(
    id: string,
    customerId: string,
  ): Promise<void> {
    const review = await this.findMyReviewById(
      id,
      customerId,
    );

    await this.reviewRepository.remove(review);
  }
}
