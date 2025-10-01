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
import { ProfileListService } from 'src/profile-list/profile-list.service';
import { Request } from 'express';

@Controller('chloe-api')
export class ChloeApiController {
    constructor(
        private readonly chloeApiService: ChloeApiService,
        private readonly profileListService: ProfileListService,
    ) {}
    @UseGuards(JwtAuthGuard)
    @Get('email')
    async getProfilesEmail(
        @Req() req: Request & { user: { email: string; id: string } },
        @Query('linkedinUrl') linkedinUrl: string,
    ) {
        console.log('Received linkedinUrl:', linkedinUrl);
        const userEmail = req.user.email;
        const userId = req.user.id;

        const userData = await this.chloeApiService.getUserData(
            userEmail,
            linkedinUrl,
            'email',
        );

        if (!userData?.profileEmail) {
            throw new Error('No email found');
        }

        const profile = await this.profileListService.registerProfileEmail({
            email: userData.profileEmail,
            linkedinUrl: linkedinUrl,
            userId: userId,
        });

        console.log('Registered profile:', profile);

        return userData;
    }

    @UseGuards(JwtAuthGuard)
    @Get('phone')
    async getProfilesPhone(
        @Req() req: Request & { user: { email: string; id: string } },
        @Query('linkedinUrl') linkedinUrl: string,
    ) {
        console.log('Received linkedinUrl:', linkedinUrl);
        const userEmail = req.user.email;
        const userId = req.user.id;

        const userData = await this.chloeApiService.getUserData(
            userEmail,
            linkedinUrl,
            'phone',
        );

        if (!userData?.profilePhone) {
            throw new Error('No phone number found');
        }

        const profile = await this.profileListService.registerProfilePhone({
            phone: userData.profilePhone,
            linkedinUrl: linkedinUrl,
            userId: userId,
        });

        return userData;
    }
}
