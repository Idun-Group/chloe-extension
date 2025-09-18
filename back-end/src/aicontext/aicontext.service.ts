import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AicontextService {
    constructor(private readonly prisma: PrismaService) {}

    async createAIContext(
        title: string,
        content: string,
        isDefault: boolean,
        ownerId: string,
    ) {
        try {
            const newContext = await this.prisma.aIContext.create({
                data: {
                    title,
                    content,
                    default: isDefault,
                    owner: {
                        connect: {
                            id: ownerId,
                        },
                    },
                },
            });
            return newContext;
        } catch (error) {
            console.error('Error creating AI context:', error);
            throw new Error('Failed to create AI context');
        }
    }

    async getAIContextsByOwner(ownerId: string) {
        try {
            const contexts = await this.prisma.aIContext.findMany({
                where: {
                    ownerId: ownerId,
                },
            });
            return contexts;
        } catch (error) {
            console.error('Error fetching AI contexts:', error);
            throw new Error('Failed to fetch AI contexts');
        }
    }

    async deleteAIContext(contextId: string, ownerId: string) {
        try {
            const deletedContext = await this.prisma.aIContext.deleteMany({
                where: {
                    id: contextId,
                    ownerId: ownerId,
                },
            });
            return deletedContext;
        } catch (error) {
            console.error('Error deleting AI context:', error);
            throw new Error('Failed to delete AI context');
        }
    }

    async updateAIContext(
        contextId: string,
        ownerId: string,
        title: string,
        content: string,
        isDefault: boolean,
    ) {
        try {
            const updatedContext = await this.prisma.aIContext.updateMany({
                where: {
                    id: contextId,
                    ownerId: ownerId,
                },
                data: {
                    title,
                    content,
                    default: isDefault,
                },
            });
            return updatedContext;
        } catch (error) {
            console.error('Error updating AI context:', error);
            throw new Error('Failed to update AI context');
        }
    }

    async setContextAsDefault(contextId: string, ownerId: string) {
        try {
            const updatedContext = await this.prisma.aIContext.updateMany({
                where: {
                    id: contextId,
                    ownerId: ownerId,
                },
                data: {
                    default: true,
                },
            });
            return updatedContext;
        } catch (error) {
            console.error('Error setting AI context as default:', error);
            throw new Error('Failed to set AI context as default');
        }
    }

    async setOtherContextsNonDefault(ownerId: string) {
        try {
            await this.prisma.aIContext.updateMany({
                where: {
                    ownerId: ownerId,
                    default: true,
                },
                data: {
                    default: false,
                },
            });
        } catch (error) {
            console.error('Error unsetting other default AI contexts:', error);
            throw new Error('Failed to unset other default AI contexts');
        }
    }
}
