
import {
    BadRequestException,
    UnauthorizedException,
    Injectable,
} from '@nestjs/common';

import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateStaffUserDto } from '../users/dto/create-staff-user.dto.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async registration(user: RegisterDto): Promise<string> {

        const hashPass = await bcrypt.hash(user.password, 10);

        const createUserDto: CreateUserDto = {
            fullName: user.fullName,
            email: user.email.trim().toLowerCase(),
            password: hashPass,
        };

        await this.usersService.create(createUserDto);

        return 'User registered successfully';
    }

    async login(login: LoginDto): Promise<string> {

        try {

            const user = await this.usersService.findByEmail(
                login.email.trim().toLowerCase()
            );

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const matchPass = await bcrypt.compare(
                login.password,
                user.password
            );

            if (!matchPass) {
                throw new UnauthorizedException('Incorrect password');
            }

            if (!user.isActive) {
                throw new UnauthorizedException('Account is inactive');
            }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
            };

            const access_token = this.jwtService.sign(payload);

            return access_token;

        } catch (error) {

            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new BadRequestException('Something went wrong');
        }
    }

    async createStaffUser(user: CreateStaffUserDto): Promise<Partial<User>> {

    const hashPass = await bcrypt.hash(user.password, 10);

    const staffUser = await this.usersService.createStaffUser({
        fullName: user.fullName,
        email: user.email.trim().toLowerCase(),
        password: hashPass,
        role: user.role,
    });

    const { password, ...result } = staffUser;

    return result;
}
}
