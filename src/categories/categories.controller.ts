import { Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards,Body } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth,ApiParam,} from '@nestjs/swagger';


@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

   @Get()
   @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns all available game categories.',
  })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully.' })
    async findAll() {
        return await this.categoriesService.findAll();
    }

    
    @Get(':id')
    @ApiOperation({
    summary: 'Get category by ID',
    description: 'Returns details of a specific category.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
    async findOne(@Param('id') id: string) {

        const category = await this.categoriesService.findOne(id);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
     @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a category',
    description: 'Allows an authenticated Admin to create a new game category.',
  })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid category information.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
    async create(@Body() category: CreateCategoryDto) {
        return await this.categoriesService.create(category);
    }

    
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
    description: 'Category ID',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid category information.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })

    async update(
        @Param('id') id: string,
        @Body() category: UpdateCategoryDto
    ) {
        return await this.categoriesService.update(id, category);
    }

    
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
    description: 'Category ID',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
    async delete(@Param('id') id: string) {
        return await this.categoriesService.delete(id);
    }
}

