import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PeopleProfileService } from './people-profile.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import CreatePeopleProfileDto from './dto/people-profile.dto';

@Controller('people-profile')
export class PeopleProfileController {
    constructor(private readonly peopleProfileService: PeopleProfileService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() body: CreatePeopleProfileDto) {
        try {
            const newProfile =
                await this.peopleProfileService.createPeopleProfile(
                    body.profileListId,
                    body.linkedinUrl,
                    body.fullName,
                    body.location,
                    body.job,
                    body.phone,
                    body.email,
                );

            return newProfile;
        } catch (error) {
            throw new Error(`Failed to create people profile: ${error}`);
        }
    }
}
