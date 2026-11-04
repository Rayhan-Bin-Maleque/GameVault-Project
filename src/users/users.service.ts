import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm/repository/Repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { CreateStaffUserDto } from './dto/create-staff-user.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async create(user: CreateUserDto): Promise<User> {
        const existingUser = await this.findByEmail(user.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
        const newUser = this.userRepository.create(user);
        return this.userRepository.save(newUser);
    }

    
    async createStaffUser(user: CreateStaffUserDto): Promise<User> {

        const existingUser = await this.findByEmail(
        user.email.trim().toLowerCase()
         );

        if (existingUser) {
        throw new ConflictException(
            'User with this email already exists'
        );
        }

        const newUser = this.userRepository.create({
        fullName: user.fullName.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
        role: user.role,
    });

    return this.userRepository.save(newUser);
}

}
