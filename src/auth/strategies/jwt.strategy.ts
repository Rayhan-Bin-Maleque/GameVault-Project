
import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: { id: string }) {

  
        const user = await this.usersService.findOne(payload.id);

  
        if (!user) {
            throw new UnauthorizedException(
                'User account not found',
            );
        }


        if (!user.isActive) {
            throw new UnauthorizedException(
                'Your account has been deactivated',
            );
        }

      
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
}
