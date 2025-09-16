import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class LinkedinTokenDTO {
    code!: string;
}

@Controller('auth/linkedin')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Post('token')
    async getExchangeCodeToToken(
        @Body() body: LinkedinTokenDTO,
    ): Promise<void> {
        if (!body.code) throw new BadRequestException('No code provided');

        const token = await this.auth.getAccessTokenFromCode(body.code);
    }
}
