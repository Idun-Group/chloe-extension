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
            });

            return newList;
        } catch (error) {
            throw new Error(`Failed to create profile list: ${error}`);
        }
    }

    async getProfileListsByOwner(ownerId: string) {
        try {
            const lists = await this.prisma.profileList.findMany({
                where: { ownerId },
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
                where: { id },
                data: { name, description, type },
            });
            return updatedList;
        } catch (error) {
            throw new Error(`Failed to update profile list: ${error}`);
        }
    }

    async deleteProfileList(id: string) {
        try {
            await this.prisma.profileList.delete({ where: { id } });
            return { message: 'Profile list deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete profile list: ${error}`);
        }
    }

    async getProfileListById(id: string) {
        try {
            const list = await this.prisma.profileList.findUnique({
                where: { id },
            });
            return list;
        } catch (error) {
            throw new Error(`Failed to retrieve profile list: ${error}`);
        }
    }
}
