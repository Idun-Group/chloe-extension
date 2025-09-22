import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrganizationProfileService } from './organization-profile.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrganizationProfileCreateInput } from './dto/organization-profile.dto';

@Controller('organization-profile')
export class OrganizationProfileController {
    constructor(
        private organizationProfileService: OrganizationProfileService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    createOrganizationProfile(@Body() body: OrganizationProfileCreateInput) {
        try {
            const newProfile =
                this.organizationProfileService.createOrganizationProfile(
                    body.profileListId,
                    body.linkedinUrl,
                    body.name,
                    body.location,
                    body.industry,
                    body.size,
                );

            return newProfile;
        } catch (error) {
            throw new Error(`Failed to create organization profile: ${error}`);
        }
    }
}
