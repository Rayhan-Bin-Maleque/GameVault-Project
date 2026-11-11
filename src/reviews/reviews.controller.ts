import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { isUUID } from 'class-validator';

import type { Request } from 'express';

import { ReviewsService } from './reviews.service.js';

import { CreateReviewDto } from './dto/create-review.dto.js';

import { UpdateReviewDto } from './dto/update-review.dto.js';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    sub?: string;
    userId?: string;
    customerId?: string;
  };
};

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  private getCustomerId(
    req: AuthenticatedRequest,
  ): string {
    const user = req.user;

    const customerId =
      user?.userId ??
      user?.sub ??
      user?.id ??
      user?.customerId;

    if (!customerId || !isUUID(customerId)) {
      throw new UnauthorizedException(
        'Authenticated customer ID not found',
      );
    }

    return customerId;
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ) {
    const customerId = this.getCustomerId(req);

    return this.reviewsService.create(
      customerId,
      dto,
    );
  }

  @Get('mine')
  findMyReviews(
    @Req() req: AuthenticatedRequest,
  ) {
    const customerId = this.getCustomerId(req);

    return this.reviewsService.findMyReviews(
      customerId,
    );
  }

  @Get('game/:gameId')
  findByGame(
    @Param('gameId', ParseUUIDPipe)
    gameId: string,
  ) {
    return this.reviewsService.findByGame(
      gameId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateReviewDto,
  ) {
    const customerId = this.getCustomerId(req);

    return this.reviewsService.update(
      id,
      customerId,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const customerId = this.getCustomerId(req);

    await this.reviewsService.remove(
      id,
      customerId,
    );

    return {
      message: 'Review deleted successfully',
    };
  }
}

