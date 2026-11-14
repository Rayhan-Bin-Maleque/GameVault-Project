
import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from './entities/user.entity.js';
import { UsersService } from './users.service.js';


@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}


  // =====================================
  // GET LOGGED-IN USER PROFILE
  // =====================================

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Get logged-in user profile',
    description: 'Returns the basic profile information of the currently authenticated user using the JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'customer@gmail.com',
        role: 'CUSTOMER',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing, invalid or expired JWT token.',
  })
  getProfile(@Req() req: any) {
    return req.user;
  }


  // =====================================
  // ADMIN ACCESS TEST
  // =====================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-test')
  @ApiOperation({
    summary: 'Test Admin access',
    description: 'Verifies whether the authenticated user has administrator privileges.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin access granted.',
    schema: {
      example: {
        message: 'Welcome Admin! Access granted.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing, invalid or expired JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required.',
  })
  adminTest() {
    return {
      message: 'Welcome Admin! Access granted.',
    };
  }


  // =====================================
  // GET ALL USERS
  // =====================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Allows administrators to retrieve all registered users. Password information is excluded from the response.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          fullName: {
            type: 'string',
            example: 'GameVault Customer',
          },
          email: {
            type: 'string',
            example: 'customer@gmail.com',
          },
          role: {
            type: 'string',
            enum: Object.values(UserRole),
            example: UserRole.CUSTOMER,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  async findAll() {
    return this.usersService.findall();
  }


  // =====================================
  // GET USER BY ID
  // =====================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Allows administrators to retrieve a specific user account using its UUID. Password information is excluded.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user account.',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        fullName: 'GameVault Customer',
        email: 'customer@gmail.com',
        role: 'CUSTOMER',
        isActive: true,
        createdAt: '2026-11-14T10:00:00.000Z',
        updatedAt: '2026-11-14T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(
        `User with ID ${id} not found`,
      );
    }

    return user;
  }


  // =====================================
  // UPDATE USER ACCOUNT STATUS
  // =====================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Toggle user account status',
    description: 'Allows administrators to toggle a user account between active and inactive. Each request reverses the current isActive value. No request body is required.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user account.',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User account status updated successfully. Password information is excluded.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        fullName: 'GameVault Customer',
        email: 'customer@gmail.com',
        role: 'CUSTOMER',
        isActive: false,
        createdAt: '2026-11-14T10:00:00.000Z',
        updatedAt: '2026-11-14T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async updateUserStatus(
    @Param('id') id: string,
  ) {
    const user = await this.usersService.updateUserStatus(id);

    const { password, ...result } = user;

    return result;
  }


  // =====================================
  // DELETE USER
  // =====================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Allows administrators to delete a user account. Administrator accounts cannot be deleted through this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user account to delete.',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
    schema: {
      example: 'User deleted successfully',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Account cannot be deleted. Administrator accounts are protected.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async deleteUser(
    @Param('id') id: string,
  ) {
    return this.usersService.deleteUser(id);
  }

}
