import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { access } from 'fs';
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
                id: user.linkedinId,
                typ: 'access',
            },

            { expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION') },
        );

        const refreshToken = this.jwtService.sign(
            {
                sub: user.linkedinId,
                typ: 'refresh',
            },
            { expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION') },
        );

        return { access_token: accessToken, refresh_token: refreshToken };
    }
}
