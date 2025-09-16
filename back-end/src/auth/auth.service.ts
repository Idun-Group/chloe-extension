import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    private readonly clientId = process.env.LINKEDIN_CLIENT_ID!;
    private readonly clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    private readonly redirectUri = process.env.LINKEDIN_REDIRECT_URI!;
    private readonly tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    private readonly userInfoUrl = 'https://www.linkedin.com/oauth/v2/userinfo';

    constructor(private readonly httpService: HttpService) {}

    async getAccessTokenFromCode(code: string) {
        const response = await firstValueFrom(
            this.httpService.post(this.tokenUrl, null, {
                params: {
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.redirectUri,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
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
