import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectRepository(Category) 
        private readonly categoryRepository: Repository<Category>
    ) {}

    async create(category: CreateCategoryDto): Promise<Category> {

        const existingCategory = await this.categoryRepository.findOne({
            where: { name: category.name.trim() }
        });

        if (existingCategory) {
            throw new ConflictException('Category already exists');
        }

        const newCategory = this.categoryRepository.create({
            name: category.name.trim(),
            description: category.description,
        });

        return await this.categoryRepository.save(newCategory);
    }

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async findOne(id: string): Promise<Category | null> {
        return await this.categoryRepository.findOne({
            where: { id }
        });
    }

    async update(
        id: string,
        category: UpdateCategoryDto
    ): Promise<Category> {

        const existingCategory = await this.categoryRepository.findOne({
            where: { id }
        });

        if (!existingCategory) {
            throw new NotFoundException('Category not found');
        }

        if (category.name) {
            const duplicateCategory = await this.categoryRepository.findOne({
                where: { name: category.name.trim() }
            });

            if (duplicateCategory && duplicateCategory.id !== id) {
                throw new ConflictException('Category already exists');
            }

            existingCategory.name = category.name.trim();
        }

        if (category.description !== undefined) {
            existingCategory.description = category.description;
        }

        return await this.categoryRepository.save(existingCategory);
    }

    async delete(id: string): Promise<string> {

        const existingCategory = await this.categoryRepository.findOne({
            where: { id }
        });

        if (!existingCategory) {
            throw new NotFoundException('Category not found');
        }

        await this.categoryRepository.remove(existingCategory);

        return 'Category deleted successfully';
    }
}

