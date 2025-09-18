import { Injectable } from '@nestjs/common';
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
        try {
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
        } catch (error) {
            throw new Error(error);
        }
    }

    async findByLinkedinId(id: string) {
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
                        select: { id: true, name: true, type: true },
                    },
                },
            });

            if (!user) {
                throw new Error('User not found');
            } else {
                return user;
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}
