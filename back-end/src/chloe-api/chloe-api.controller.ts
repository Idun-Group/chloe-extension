import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChloeApiService } from './chloe-api.service';
import { ChloeGetContactInput } from './dto/chloe-api.input';

@Controller('chloe-api')
export class ChloeApiController {
    constructor(private readonly chloeApiService: ChloeApiService) {}
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProtectedResource(
        @Req() req,
        @Query('linkedinUrl') linkedinUrl: string,
    ) {
        console.log('Received linkedinUrl:', linkedinUrl);
        const email = req.user.email;

        const userData = await this.chloeApiService.getUserData(
            email,
            linkedinUrl,
        );

        return userData;
    }
}
