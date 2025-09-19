import {
    Body,
    Controller,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ProfileListService } from './profile-list.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProfileListDto } from './dto/profil-list.dto';
import { ListType } from 'generated/prisma';

@Controller('profile-list')
export class ProfileListController {
    constructor(private readonly profileListService: ProfileListService) {}

    // Implement CRUD endpoints here

    @UseGuards(JwtAuthGuard)
    @Post()
    async createProfileList(@Body() body: CreateProfileListDto, @Req() req) {
        try {
            const userId = req.user.id;
            const { type, name, description } = body;
            const newList = await this.profileListService.createProfileList(
                type as ListType,
                name,
                description,
                userId,
            );

            return newList;
        } catch (error) {
            throw new Error(`Failed to create profile list: ${error}`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':type')
    async getProfileListsByType(@Req() req, @Param('type') type: ListType) {
        try {
            const userId = req.user.id;
            const lists = await this.profileListService.getProfileListsByType(
                userId,
                type,
            );
            return lists;
        } catch (error) {
            throw new Error(`Failed to retrieve profile list: ${error}`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getProfileLists(@Req() req) {
        try {
            const userId = req.user.id;
            const profileLists =
                await this.profileListService.getProfileListsByOwner(userId);
            return profileLists;
        } catch (error) {
            throw new Error(`Failed to retrieve profile lists: ${error}`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProfileListById(@Param('id') id: string, @Req() req) {
        try {
            const userId = req.user.id;
            const profileList =
                await this.profileListService.getProfileListById(id);

            if (profileList) {
                if (profileList.ownerId !== userId) {
                    throw new HttpException(
                        'Unauthorized access to this profile list',
                        403,
                    );
                } else {
                    return profileList;
                }
            } else {
                throw new HttpException('Profile list not found', 404);
            }
        } catch (error) {
            throw new Error(`Failed to retrieve profile lists: ${error}`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateProfileList(
        @Param('id') id: string,
        @Body() body: CreateProfileListDto,
        @Req() req,
    ) {
        try {
            const userId = req.user.id;
            const existingList =
                await this.profileListService.getProfileListById(id);
            if (existingList) {
                if (existingList.ownerId !== userId) {
                    throw new HttpException(
                        'Unauthorized access to this profile list',
                        403,
                    );
                }
                const { type, name, description } = body;
                const updatedList =
                    await this.profileListService.updateProfileList(
                        id,
                        name,
                        description,
                        type as ListType,
                    );
                return updatedList;
            } else {
                throw new HttpException('Profile list not found', 404);
            }
        } catch (error) {
            throw new Error(`Failed to update profile list: ${error}`);
        }
    }
}
