
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // Create a new category
  async create(category: CreateCategoryDto): Promise<Category> {
    const name = category.name.trim();

    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const newCategory = this.categoryRepository.create({
      name,
      description: category.description,
    });

    return this.categoryRepository.save(newCategory);
  }

  // Retrieve all categories
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Retrieve one category by ID
  async findOne(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
    });
  }

  // Update an existing category
  async update(
    id: string,
    category: UpdateCategoryDto,
  ): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (category.name !== undefined) {
      const name = category.name.trim();

      const duplicateCategory = await this.categoryRepository.findOne({
        where: { name },
      });

      if (duplicateCategory && duplicateCategory.id !== id) {
        throw new ConflictException('Category already exists');
      }

      existingCategory.name = name;
    }

    if (category.description !== undefined) {
      existingCategory.description = category.description;
    }

    return this.categoryRepository.save(existingCategory);
  }

  // Delete a category
  async delete(id: string): Promise<string> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.remove(existingCategory);

    return 'Category deleted successfully';
  }
}
