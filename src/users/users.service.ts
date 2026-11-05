import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity.js';
import { Repository } from 'typeorm/repository/Repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { CreateStaffUserDto } from './dto/create-staff-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

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


    async findall(): Promise<User[]> {

         return await this.userRepository.find({
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            }})
    }


    async findOne(id: string): Promise<User | null> {
        return this.userRepository.findOne({
             where: { id },
             select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
             }
        });
    }


    async updateUser(id: string, user: UpdateUserDto): Promise<Partial<User>> {
        const existingUser = await this.userRepository.findOne({ where: { id } });
        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        Object.assign(existingUser, user);
         const updatedUser = await this.userRepository.save(existingUser);
         const { password, ...result } = updatedUser;
         return result;
       
    } 
        

          
      async updateUserStatus(id: string): Promise<User> {

      const existingUser = await this.userRepository.findOne({
        where: { id }
       });

       if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
       }

      existingUser.isActive = !existingUser.isActive;

      return await this.userRepository.save(existingUser);
    }

    async deleteUser(id: string): Promise<string> {

        const existingUser = await this.userRepository.findOne({ where: { id } });
        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (existingUser.role === UserRole.ADMIN) {
            throw new BadRequestException(
            ' Account cannot be deleted'
        );
        } 

        await this.userRepository.remove(existingUser);

        return 'User deleted successfully';
        }








}

        
