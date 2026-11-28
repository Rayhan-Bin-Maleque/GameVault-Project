
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  // Get all categories (Public)
  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns all available game categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully.',
  })
  async findAll() {
    return this.categoriesService.findAll();
  }

  // Get category by ID (Public)
  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Returns details of a specific category.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category UUID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const category = await this.categoriesService.findOne(id);

    if (!category) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // Create category (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a category',
    description: 'Allows an authenticated Admin to create a new game category.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required.',
  })
  @ApiResponse({
    status: 409,
    description: 'Category already exists.',
  })
  async create(
    @Body() category: CreateCategoryDto,
  ) {
    return this.categoriesService.create(category);
  }

  // Update category (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a category',
    description: 'Allows an authenticated Admin to update an existing category.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category information or UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Category already exists.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() category: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, category);
  }

  // Delete category (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a category',
    description: 'Allows an authenticated Admin to delete a category.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.delete(id);
  }
}
