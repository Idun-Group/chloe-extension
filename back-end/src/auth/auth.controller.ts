import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist/config.service';
import type { Request, Response } from 'express';

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
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ access_token: string; access_token_expire_in: number }> {
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
                email: user.email,
                type: 'access',
            },

            { expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION') },
        );

        const refreshToken = this.jwtService.sign(
            {
                id: user.id,
                email: user.email,
                type: 'refresh',
            },
            { expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION') },
        );

        await this.authService.storeRefreshToken(user.id, refreshToken);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: this.config.get<string>('NODE_ENV') === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return { access_token: accessToken, access_token_expire_in: 900 };
    }

    @Post('refresh')
    async refresh(@Req() req: Request) {
        const refreshToken = req.cookies['refresh_token'];

        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        const payload = this.jwtService.verify(refreshToken);

        if (payload.type !== 'refresh') {
            throw new UnauthorizedException('Invalid token type');
        }

        await this.authService.assertRefreshValid(payload.id, refreshToken);

        const newAccess = this.jwtService.sign(
            { id: payload.id, email: payload.email, type: 'access' },
            { expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION') },
        );

        return { access_token: newAccess, access_token_expire_in: 900 };
    }

    @Post('logout')
    async logout(@Req() req: Request) {
        const refresh_token = req.cookies['refresh_token'];
        if (!refresh_token) {
            throw new BadRequestException('Refresh token is required');
        }

        try {
            const payload = this.jwtService.verify(refresh_token);

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            await this.authService.revokeRefreshToken(
                payload.id,
                refresh_token,
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
