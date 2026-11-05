
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity.js';
import { Category } from '../categories/entities/category.entity.js';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async getDashboardStats() {

        const totalUsers = await this.userRepository.count();

        const totalCustomers = await this.userRepository.count({
            where: { role: UserRole.CUSTOMER },
        });

        const totalPublishers = await this.userRepository.count({
            where: { role: UserRole.PUBLISHER },
        });

        const totalSupportAgents = await this.userRepository.count({
            where: { role: UserRole.SUPPORT },
        });

        const totalAdmins = await this.userRepository.count({
            where: { role: UserRole.ADMIN },
        });

        const activeUsers = await this.userRepository.count({
            where: { isActive: true },
        });

        const inactiveUsers = await this.userRepository.count({
            where: { isActive: false },
        });

        const totalCategories = await this.categoryRepository.count();

        return {
            totalUsers,
            totalCustomers,
            totalPublishers,
            totalSupportAgents,
            totalAdmins,
            activeUsers,
            inactiveUsers,
            totalCategories,
        };
    }
}
