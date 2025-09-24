import {
    Body,
    Controller,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import { ProfileListService } from './profile-list.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProfileListDto } from './dto/profil-list.dto';
import { ListType } from 'generated/prisma';
import { DataConverterService } from 'src/data-converter/data-converter.service';

@Controller('profile-list')
export class ProfileListController {
    constructor(
        private readonly profileListService: ProfileListService,
        private readonly dataConverterService: DataConverterService,
    ) {}

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
    @Get()
    async getProfileListsByType(@Req() req, @Query('type') type: ListType) {
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

    @UseGuards(JwtAuthGuard)
    @Get('/test-csv')
    async testCsv() {
        console.log('🧪 Test CSV endpoint called');
        const testData = [
            { id: '1', name: 'Test User', email: 'test@example.com' },
            { id: '2', name: 'Another User', email: 'another@example.com' },
        ];

        try {
            const csvData = await this.dataConverterService.listToCSV(testData);
            console.log('✅ Test CSV generated:', csvData.length, 'characters');

            return new StreamableFile(Buffer.from(csvData), {
                type: 'text/csv; charset=utf-8',
                disposition: 'attachment; filename="test.csv"',
            });
        } catch (error) {
            console.error('💥 Test CSV error:', error);
            throw new HttpException('Test CSV failed', 500);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/csv/:id')
    async exportProfileListToCsv(
        @Param('id') id: string,
        @Req() req,
        @Query('type') type: ListType,
    ) {
        try {
            const userId = req.user.id;
            console.log('🔍 Exporting CSV for list:', id, 'user:', userId);

            const profileList =
                await this.profileListService.getProfileListById(id);

            if (!profileList) {
                console.log('❌ Profile list not found:', id);
                throw new HttpException('Profile list not found', 404);
            }

            if (profileList.ownerId !== userId) {
                console.log(
                    '❌ Unauthorized access. Owner:',
                    profileList.ownerId,
                    'User:',
                    userId,
                );
                throw new HttpException(
                    'Unauthorized access to this profile list',
                    403,
                );
            }

            console.log(
                '✅ Profile list found:',
                profileList.name,
                'type:',
                profileList.type,
            );

            let dataToConvert: Record<string, any>[] = [];

            if (profileList.type === 'PEOPLE') {
                console.log(
                    '📊 Processing PEOPLE profiles:',
                    profileList.peopleProfiles?.length || 0,
                );
                // Normalize people profiles data for CSV export
                dataToConvert =
                    profileList.peopleProfiles?.map((profile) => ({
                        id: profile.id,
                        linkedinUrl: profile.linkedinUrl,
                        fullName: profile.fullName,
                        job: profile.job || '',
                        location: profile.location,
                        phone: profile.phone || '',
                        email: profile.email || '',
                        createdAt: profile.createdAt,
                        updatedAt: profile.updatedAt,
                    })) || [];
            } else {
                console.log(
                    '🏢 Processing ORGANIZATION profiles:',
                    profileList.organizationProfiles?.length || 0,
                );
                // Normalize organization profiles data for CSV export
                dataToConvert =
                    profileList.organizationProfiles?.map((profile) => ({
                        id: profile.id,
                        linkedinUrl: profile.linkedinUrl,
                        name: profile.name,
                        location: profile.location || '',
                        industry: profile.industry || '',
                        size: profile.size || '',
                        updatedAt: profile.updatedAt,
                    })) || [];
            }

            console.log('🔄 Data to convert:', dataToConvert.length, 'items');

            // Pour les listes vides, créer un array vide - csv-stringify s'occupera des headers
            if (dataToConvert.length === 0) {
                console.log(
                    '⚠️ No data to convert, but will generate CSV with headers only',
                );
            }

            console.log('⏳ Generating CSV...');
            const csvData =
                await this.dataConverterService.listToCSV(dataToConvert);
            console.log(
                '✅ CSV generated successfully, length:',
                csvData.length,
            );

            return new StreamableFile(Buffer.from(csvData), {
                type: 'text/csv; charset=utf-8',
                disposition: `attachment; filename="${profileList.name.split(' ').join('_')}.csv"`,
            });
        } catch (error) {
            console.error('💥 CSV export error:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                `Failed to export profile list to CSV: ${error.message}`,
                500,
            );
        }
    }
}
