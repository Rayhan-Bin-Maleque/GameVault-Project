import { Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards,Body } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

   @Get()
    async findAll() {
        return await this.categoriesService.findAll();
    }

    // View category by ID
    @Get(':id')
    async findOne(@Param('id') id: string) {

        const category = await this.categoriesService.findOne(id);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    // Create category - ADMIN only
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    async create(@Body() category: CreateCategoryDto) {
        return await this.categoriesService.create(category);
    }

    // Update category - ADMIN only
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() category: UpdateCategoryDto
    ) {
        return await this.categoriesService.update(id, category);
    }

    // Delete category - ADMIN only
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.categoriesService.delete(id);
    }
}

