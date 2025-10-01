import { Injectable } from '@nestjs/common';
import { ListType } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileListService {
    constructor(private readonly prisma: PrismaService) {}
    async createProfileList(
        type: ListType,
        name: string,
        description: string,
        ownerId: string,
    ) {
        try {
            const newList = await this.prisma.profileList.create({
                data: {
                    type,
                    name,
                    description,
                    owner: { connect: { id: ownerId } },
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    peopleProfiles: true,
                },
            });

            return newList;
        } catch (error) {
            throw new Error(`Failed to create profile list: ${error}`);
        }
    }

    async getProfileListsByOwner(ownerId: string) {
        try {
            const lists = await this.prisma.profileList.findMany({
                where: { ownerId, type: { not: ListType.HISTORY } },
            });
            return lists;
        } catch (error) {
            throw new Error(`Failed to retrieve profile lists: ${error}`);
        }
    }

    async getLazyProfileListsByOwner(ownerId: string) {
        try {
            const lists = await this.prisma.profileList.findMany({
                where: { ownerId, type: { not: ListType.HISTORY } },
                select: {
                    id: true,
                },
            });
            return lists;
        } catch (error) {
            throw new Error(`Failed to retrieve profile lists: ${error}`);
        }
    }

    async getProfileListsByType(ownerId: string, type: ListType) {
        try {
            const lists = await this.prisma.profileList.findMany({
                where: { ownerId, type },
            });
            return lists;
        } catch (error) {
            throw new Error(`Failed to retrieve profile lists: ${error}`);
        }
    }

    async updateProfileList(
        id: string,
        name: string,
        description: string,
        type: ListType,
    ) {
        try {
            const updatedList = await this.prisma.profileList.update({
                where: { id, type: { not: ListType.HISTORY } },
                data: { name, description, type },
            });
            return updatedList;
        } catch (error) {
            throw new Error(`Failed to update profile list: ${error}`);
        }
    }

    async deleteProfileList(id: string) {
        try {
            await this.prisma.profileList.delete({
                where: { id, type: { not: ListType.HISTORY } },
            });
            return { message: 'Profile list deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete profile list: ${error}`);
        }
    }

    async getProfileListById(id: string) {
        try {
            const list = await this.prisma.profileList.findUnique({
                where: { id, type: { not: ListType.HISTORY } },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    ownerId: true,
                    peopleProfiles: true,
                    organizationProfiles: true,
                },
            });
            return list;
        } catch (error) {
            throw new Error(`Failed to retrieve profile list: ${error}`);
        }
    }

    async registerProfileInHistory(linkedinUrl: string, ownerId: string) {
        try {
            const historyList = await this.prisma.profileList.findFirst({
                where: { type: ListType.HISTORY, ownerId },
            });

            console.log('History List:', historyList);

            if (!historyList) {
                throw new Error('History list not found');
            }

            if (linkedinUrl.includes('linkedin.com/in/')) {
                const checkExistingProfile =
                    await this.prisma.peopleProfile.findFirst({
                        where: {
                            profileListId: historyList.id,
                            linkedinUrl,
                        },
                    });
                console.log('Existing Profile:', checkExistingProfile);

                if (checkExistingProfile) {
                    console.log(
                        'Profile already in history:',
                        checkExistingProfile,
                    );
                    return checkExistingProfile;
                } else {
                    console.log('Creating new profile in history');
                    const newProfile = await this.prisma.peopleProfile.create({
                        data: {
                            linkedinUrl,
                            profileList: { connect: { id: historyList.id } },
                        },
                    });

                    return newProfile;
                }
            } else if (
                linkedinUrl.includes('linkedin.com/company/') ||
                linkedinUrl.includes('linkedin.com/school/')
            ) {
                const checkExistingProfile =
                    await this.prisma.organizationProfile.findFirst({
                        where: {
                            profileListId: historyList.id,
                            linkedinUrl,
                        },
                    });

                if (checkExistingProfile) {
                    return checkExistingProfile;
                } else {
                    const newProfile =
                        await this.prisma.organizationProfile.create({
                            data: {
                                linkedinUrl,
                                profileList: {
                                    connect: { id: historyList.id },
                                },
                            },
                        });

                    return newProfile;
                }
            }
        } catch (error) {
            throw new Error(`Failed to register profile in history: ${error}`);
        }
    }

    async registerProfileEmail(data: {
        email: string;
        linkedinUrl: string;
        userId: string;
    }) {
        try {
            const profilesList = await this.prisma.profileList.findMany({
                where: { ownerId: data.userId },
            });

            profilesList.forEach(async (profiles) => {
                await this.prisma.peopleProfile.updateMany({
                    where: {
                        profileListId: profiles.id,
                        linkedinUrl: data.linkedinUrl,
                    },
                    data: { email: data.email },
                });

                await this.prisma.organizationProfile.updateMany({
                    where: {
                        profileListId: profiles.id,
                        linkedinUrl: data.linkedinUrl,
                    },
                    data: { email: data.email },
                });
            });
        } catch (error) {
            throw new Error(`Failed to register profile email: ${error}`);
        }
    }

    async registerProfilePhone(data: {
        phone: string;
        linkedinUrl: string;
        userId: string;
    }) {
        try {
            const profilesList = await this.prisma.profileList.findMany({
                where: { ownerId: data.userId },
            });

            profilesList.forEach(async (profiles) => {
                await this.prisma.peopleProfile.updateMany({
                    where: {
                        profileListId: profiles.id,
                        linkedinUrl: data.linkedinUrl,
                    },
                    data: { phone: data.phone },
                });

                await this.prisma.organizationProfile.updateMany({
                    where: {
                        profileListId: profiles.id,
                        linkedinUrl: data.linkedinUrl,
                    },
                    data: { phone: data.phone },
                });
            });
        } catch (error) {
            throw new Error(`Failed to register profile phone: ${error}`);
        }
    }
}
