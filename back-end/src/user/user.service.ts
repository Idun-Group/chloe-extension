import { Injectable } from '@nestjs/common';
import { ListType } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async createOrUpdate(
        id: string,
        email: string,
        linkedinToken: string,
        fullName: string,
        imageUrl: string,
    ) {
        const user = await this.prisma.user.upsert({
            where: { linkedinId: id },
            update: {
                email,
                linkedinToken,
                fullName,
                imageUrl,
            },
            create: {
                linkedinId: id,
                email,
                linkedinToken,
                fullName,
                imageUrl,
                profileList: {
                    create: {
                        name: 'Default History List',
                        description:
                            'List that contains all your previously analyzed profiles',
                        type: ListType.HISTORY,
                    },
                },
            },
            select: {
                id: true,
                linkedinId: true,
                email: true,
                fullName: true,
                imageUrl: true,
            },
        });
        return user;
    }

    async findById(id: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    linkedinId: true,
                    email: true,
                    fullName: true,
                    imageUrl: true,
                    aiContext: {
                        select: {
                            id: true,
                            title: true,
                            content: true,
                            default: true,
                        },
                    },
                    profileList: {
                        where: {
                            type: { not: ListType.HISTORY },
                        },
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            peopleProfiles: true,
                            organizationProfiles: true,
                        },
                    },
                },
            });

            if (!user) {
                throw new Error('User not found');
            } else {
                return user;
            }
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : String(error),
            );
        }
    }
}
