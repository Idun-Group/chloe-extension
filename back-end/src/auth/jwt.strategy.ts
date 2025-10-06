import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    // <-- 'jwt'
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        });
    }
    validate(payload: { id: string; email: string; type: string }) {
        if (payload.type !== 'access') {
            return null; // Seuls les access tokens sont valides pour l'authentification
        }
        return { id: payload.id, email: payload.email, type: payload.type };
    }
}
