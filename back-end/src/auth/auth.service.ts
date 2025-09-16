import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly httpService: HttpService,
        private configService: ConfigService,
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
            acces_token: string;
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
}
