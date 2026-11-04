
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';

import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
    imports: [
        UsersModule,

        PassportModule.register({
            defaultStrategy: 'jwt',
        }),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],

            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>(
                        'JWT_EXPIRES_IN'
                    ) as JwtSignOptions['expiresIn'],
                },
            }),
        }),
    ],

    controllers: [AuthController],

    providers: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
    ],

    exports: [PassportModule],
})
export class AuthModule {}
