import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist/config.service';

class LinkedinTokenDTO {
    code!: string;
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    async login(
        @Body() body: LinkedinTokenDTO,
    ): Promise<{ access_token: string; refresh_token: string }> {
        const token = await this.auth.getAccessTokenFromCode(body.code);

        const userInfo = await this.auth.getUserInfo(token.access_token);

        if (!userInfo) {
            throw new BadRequestException(
                'Could not fetch user info from LinkedIn',
            );
        }

        const user = await this.userService.createOrUpdate(
            userInfo.sub,
            userInfo.email,
            token.access_token,
            userInfo.name,
            userInfo.picture,
        );

        const accessToken = this.jwtService.sign(
            {
                id: user.id,
                type: 'access',
            },

            { expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION') },
        );

        const refreshToken = this.jwtService.sign(
            {
                id: user.id,
                type: 'refresh',
            },
            { expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION') },
        );

        await this.authService.storeRefreshToken(user.id, refreshToken);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    @Post('refresh')
    async refresh(@Body() body: { refresh_token: string }) {
        if (!body.refresh_token) {
            throw new BadRequestException('Refresh token is required');
        }

        const payload = this.jwtService.verify(body.refresh_token);

        if (payload.type !== 'refresh') {
            throw new UnauthorizedException('Invalid token type');
        }

        await this.authService.assertRefreshValid(
            payload.id,
            body.refresh_token,
        );

        const newAccess = this.jwtService.sign(
            { id: payload.id, type: 'access' },
            { expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION') },
        );

        return { access_token: newAccess };
    }

    @Post('logout')
    async logout(@Body() body: { refresh_token: string }) {
        if (!body.refresh_token) {
            throw new BadRequestException('Refresh token is required');
        }

        try {
            const payload = this.jwtService.verify(body.refresh_token);

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            await this.authService.revokeRefreshToken(
                payload.id,
                body.refresh_token,
            );

            return { message: 'Successfully logged out' };
        } catch (error) {
            // Même si le token est invalide, on considère le logout réussi
            return { message: 'Successfully logged out' };
        }
    }

    @Post('logout-all')
    async logoutAll(@Body() body: { refresh_token: string }) {
        if (!body.refresh_token) {
            throw new BadRequestException('Refresh token is required');
        }

        try {
            const payload = this.jwtService.verify(body.refresh_token);

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            await this.authService.revokeAllUserRefreshTokens(payload.id);

            return { message: 'Successfully logged out from all devices' };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
