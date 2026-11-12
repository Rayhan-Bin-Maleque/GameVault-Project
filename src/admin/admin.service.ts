
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import {
    User,
    UserRole,
} from '../users/entities/user.entity.js';

import { Category } from '../categories/entities/category.entity.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';

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

    

    async getAllStaff() {

        const staff = await this.userRepository.find({

            where: {
                role: In([
                    UserRole.PUBLISHER,
                    UserRole.SUPPORT,
                ]),
            },

            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },

            order: {
                createdAt: 'DESC',
            },
        });

        return {
            message: 'Staff retrieved successfully',
            totalStaff: staff.length,
            staff,
        };
    }

    

    async getStaffById(id: string) {

        const staff = await this.userRepository.findOne({

            where: {
                id,
                role: In([
                    UserRole.PUBLISHER,
                    UserRole.SUPPORT,
                ]),
            },

            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!staff) {
            throw new NotFoundException(
                'Staff member not found',
            );
        }

        return {
            message: 'Staff member retrieved successfully',
            staff,
        };
    }


async updateStaff(
    id: string,
    staffData: UpdateStaffDto,
) {
    const staff = await this.userRepository.findOne({
        where: {
            id,
            role: In([
                UserRole.PUBLISHER,
                UserRole.SUPPORT,
            ]),
        },
    });

    if (!staff) {
        throw new NotFoundException(
            'Staff member not found',
        );
    }

    if (staffData.email) {
        const existingUser = await this.userRepository.findOne({
            where: {
                email: staffData.email,
            },
        });

        if (existingUser && existingUser.id !== id) {
            throw new ConflictException(
                'Email address is already in use',
            );
        }
    }

    Object.assign(staff, staffData);

    const updatedStaff = await this.userRepository.save(staff);

    const { password, ...result } = updatedStaff;

    return {
        message: 'Staff updated successfully',
        staff: result,
    };
}        
     

             
async updateStaffStatus(
    id: string,
    isActive: boolean,
) {

    const staff = await this.userRepository.findOne({
        where: {
            id,
            role: In([
                UserRole.PUBLISHER,
                UserRole.SUPPORT,
            ]),
        },
    });

    if (!staff) {
        throw new NotFoundException(
            'Staff member not found',
        );
    }

    staff.isActive = isActive;

    const updatedStaff = await this.userRepository.save(staff);

    return {
        message: isActive
            ? 'Staff account activated successfully'
            : 'Staff account deactivated successfully',

        staff: {
            id: updatedStaff.id,
            fullName: updatedStaff.fullName,
            email: updatedStaff.email,
            role: updatedStaff.role,
            isActive: updatedStaff.isActive,
            updatedAt: updatedStaff.updatedAt,
        },
    };
}


}
