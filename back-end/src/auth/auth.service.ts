import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    private readonly tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    private readonly userInfoUrl = 'https://api.linkedin.com/v2/userinfo';

    async getAccessTokenFromCode(code: string) {
        const response = await firstValueFrom(
            this.httpService.post(this.tokenUrl, null, {
                params: {
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.configService.get<string>(
                        'LINKEDIN_REDIRECT_URI',
                    ),
                    client_id:
                        this.configService.get<string>('LINKEDIN_CLIENT_ID'),
                    client_secret: this.configService.get<string>(
                        'LINKEDIN_CLIENT_SECRET',
                    ),
                },
            }),
        ).catch((e) => {
            const data = e.response?.data;
            throw new UnauthorizedException(
                `Token exchange failed: ${JSON.stringify(data)}`,
            );
        });

        console.log('Token response:', response.data);

        return response.data as {
            access_token: string;
            expires_in: number;
            scope: string;
            token_type?: string;
            id_token?: string;
        };
    }


    async getUserInfo(accessToken: string) {
        const response = await firstValueFrom(
            this.httpService.get(this.userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }),
        ).catch((e) => {
            const data = e.response?.data;
            throw new UnauthorizedException(
                `User info retrieval failed: ${JSON.stringify(data)}`,
            );
        });

        return response.data;
    }

    async storeRefreshToken(userId: string, refreshToken: string) {
        const hashedToken = await argon2.hash(refreshToken);

        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: hashedToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
    }

    async assertRefreshValid(userId: string, refreshToken: string) {
        const dbToken = await this.prisma.refreshToken.findFirst({
            where: { userId },
            orderBy: { expiresAt: 'desc' },
        });

        if (!dbToken) throw new UnauthorizedException('No refresh token found');

        const isValid = await argon2.verify(dbToken.tokenHash, refreshToken);

        if (!isValid) throw new UnauthorizedException('Invalid refresh token');

        if (dbToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        return true;
    }

    async revokeAllUserRefreshTokens(userId: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    async revokeRefreshToken(userId: string, refreshToken: string) {
        const hashedToken = await argon2.hash(refreshToken);

        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                tokenHash: hashedToken,
            },
        });
    }

    async cleanExpiredTokens() {
        await this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
}
