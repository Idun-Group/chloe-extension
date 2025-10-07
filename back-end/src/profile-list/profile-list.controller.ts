import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Query,
    Req,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import { ProfileListService } from './profile-list.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProfileListDto } from './dto/profil-list.dto';
import { ListType, ProfileList } from 'generated/prisma';
import { DataConverterService } from 'src/data-converter/data-converter.service';
import type { Request } from 'express';

@Controller('profile-list')
export class ProfileListController {
    constructor(
        private readonly profileListService: ProfileListService,
        private readonly dataConverterService: DataConverterService,
    ) {}

    // Implement CRUD endpoints here

    @UseGuards(JwtAuthGuard)
    @Post()
    async createProfileList(
        @Body() body: CreateProfileListDto,
        @Req() req: Request & { user: { id: string; email: string } },
    ) {
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
    async getProfileListsByType(
        @Req() req: Request & { user: { id: string; email: string } },
        @Query('type') type: ListType,
    ): Promise<ProfileList[]> {
        console.log('Fetching profile lists of type:', type);
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
    @Get('lazy')
    async getLazyProfileLists(
        @Req() req: Request & { user: { id: string; email: string } },
    ) {
        try {
            const userId = req.user.id;
            const lists =
                await this.profileListService.getLazyProfileListsByOwner(
                    userId,
                );
            return lists;
        } catch (error) {
            throw new Error(`Failed to retrieve profile list: ${error}`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getProfileLists(
        @Req() req: Request & { user: { id: string; email: string } },
    ) {
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
    async getProfileListById(
        @Param('id') id: string,
        @Req() req: Request & { user: { id: string; email: string } },
    ) {
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
        @Req() req: Request & { user: { id: string; email: string } },
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
    @Delete(':id')
    async deleteProfileList(
        @Param('id') id: string,
        @Req() req: Request & { user: { id: string; email: string } },
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
                await this.profileListService.deleteProfileList(id);
                return { message: 'Profile list deleted successfully' };
            } else {
                throw new HttpException('Profile list not found', 404);
            }
        } catch (error) {
            throw new Error(`Failed to delete profile list: ${error}`);
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
        @Req() req: Request & { user: { id: string; email: string } },
    ) {
        try {
            const userId = req.user?.id;
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
                // Normalize people profiles data for CSV export (UTF-8)
                dataToConvert =
                    profileList.peopleProfiles?.map((profile) => ({
                        'linkedin de la cible': profile.linkedinUrl,
                        nom: profile.fullName?.split(' ')[0],
                        prénom: profile.fullName?.split(' ')[1] || '',
                        "rôle de l'entreprise": profile.job || '',
                        localisation: profile.location,
                        téléphone: profile.phone || '',
                        email: profile.email || '',
                        'date de création': new Date(
                            profile.createdAt,
                        ).toLocaleDateString('fr-FR'),
                        'date de mise à jour': new Date(
                            profile.updatedAt,
                        ).toLocaleDateString('fr-FR'),
                    })) || [];
            } else {
                console.log(
                    '🏢 Processing ORGANIZATION profiles:',
                    profileList.organizationProfiles?.length || 0,
                );
                // Normalize organization profiles data for CSV export (UTF-8)
                dataToConvert =
                    profileList.organizationProfiles?.map((profile) => ({
                        "nom de l'entreprise": profile.name,
                        localisation: profile.location || '',
                        secteur: profile.industry || '',
                        "taille de l'entreprise": profile.size || '',
                        'date de mise à jour': new Date(
                            profile.updatedAt,
                        ).toLocaleDateString('fr-FR'),
                        "linkedin de l'entreprise": profile.linkedinUrl,
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

            // Créer le buffer avec encodage UTF-8 explicite
            const csvBuffer = Buffer.from(csvData, 'utf8');

            return new StreamableFile(csvBuffer, {
                type: 'text/csv; charset=utf-8',
                disposition: `attachment; filename*=UTF-8''${encodeURIComponent(profileList.name.split(' ').join('_'))}.csv`,
            });
        } catch {
            throw new HttpException(
                `Failed to export profile list to CSV`,
                500,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/history/register')
    async registerProfileInHistory(
        @Query('linkedinUrl') linkedinUrl: string,
        @Req() req: Request & { user: { id: string; email: string } },
    ) {
        const ownerId = req.user.id;

        const profile = await this.profileListService.registerProfileInHistory(
            linkedinUrl,
            ownerId,
        );

        console.log(profile);

        if (profile) {
            console.log('Profile registered in history:', profile);
            return {
                message: 'Profile registered in history successfully.',
                profile,
            };
        } else {
            throw new HttpException(
                'Failed to register profile in history.',
                500,
            );
        }
    }
}
