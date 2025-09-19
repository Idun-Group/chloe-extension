import { Body, Controller, Get, Post } from '@nestjs/common';
import { PeopleProfileService } from './people-profile.service';
import { PeopleProfileCreateInput } from './dto/people-profile.dto';

@Controller('people-profile')
export class PeopleProfileController {
    constructor(private readonly peopleProfileService: PeopleProfileService) {}

    @Post()
    async create(@Body() body: PeopleProfileCreateInput) {
        try {
            console.log(body);
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
