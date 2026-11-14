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

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';
import { isUUID } from 'class-validator';
import type { Request } from 'express';

import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    sub?: string;
    userId?: string;
    customerId?: string;
  };
};

@ApiTags('Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Create game review',
    description:
      'Allows a CUSTOMER to create a review with a rating from 1 to 5.',
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid review data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
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
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get my reviews',
    description: 'Returns reviews created by the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer reviews retrieved.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  findMyReviews(
    @Req() req: AuthenticatedRequest,
  ) {
    const customerId = this.getCustomerId(req);

    return this.reviewsService.findMyReviews(
      customerId,
    );
  }

  @Get('game/:gameId')
  @ApiOperation({
    summary: 'Get reviews for a game',
    description:
      'Returns reviews associated with a particular game. JWT authentication is required.',
  })
  @ApiParam({
    name: 'gameId',
    description: 'Game UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Game reviews retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Invalid game UUID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findByGame(
    @Param('gameId', ParseUUIDPipe)
    gameId: string,
  ) {
    return this.reviewsService.findByGame(gameId);
  }

  @Patch(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Update my review',
    description:
      'Allows a CUSTOMER to update only their own review.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review UUID',
    type: String,
  })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid review data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
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
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete my review',
    description:
      'Allows a CUSTOMER to delete only their own review.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid review UUID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Customer only.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
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


