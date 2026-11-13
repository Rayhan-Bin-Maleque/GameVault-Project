
import {
    Controller,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

import { CreateStaffUserDto } from '../users/dto/create-staff-user.dto.js';
import { UserRole } from '../users/entities/user.entity.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';

import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth,} from '@nestjs/swagger';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
     @ApiOperation({
        summary: 'Register a new customer',
        description: 'Creates a new customer account in GameVault.',
    })
    @ApiResponse({ status: 201, description: 'Customer registered successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid registration information.' })
    @ApiResponse({ status: 409, description: 'Email already exists.' })
    async register(@Body() user: RegisterDto): Promise<string> {
        return this.authService.registration(user);
    }

    @Post('login')
    @ApiOperation({
        summary: 'Login to GameVault',
        description: 'Authenticates a user and returns a JWT access token.',
    })
    @ApiResponse({ status: 201, description: 'Login successful. Returns JWT token.' })
    @ApiResponse({ status: 401, description: 'Invalid email or password.' })
    async login(@Body() user: LoginDto): Promise<string> {
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('create-staff')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create a staff account',
        description: 'Allows an authenticated administrator to create Publisher or Support accounts.',
    })
    @ApiResponse({ status: 201, description: 'Staff account created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid staff information.' })
    @ApiResponse({ status: 401, description: 'Unauthorized - JWT token is missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
    @ApiResponse({ status: 409, description: 'Email already exists.' })
    async createStaff(@Body() user: CreateStaffUserDto) {
        return this.authService.createStaffUser(user);
    }
}
