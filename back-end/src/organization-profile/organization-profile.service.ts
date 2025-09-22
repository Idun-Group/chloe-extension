import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationProfileService {
    constructor(private prisma: PrismaService) {}

    async createOrganizationProfile(
        listId: string,
        linkedinUrl: string,
        name: string,
        location: string,
        industry?: string,
        size?: string,
    ) {
        // Vérifier si le profil existe déjà
        const existingProfile = await this.prisma.organizationProfile.findFirst(
            {
                where: {
                    profileListId: listId,
                    linkedinUrl,
                },
            },
        );

        if (existingProfile) {
            // Mettre à jour le profil existant
            return this.prisma.organizationProfile.update({
                where: { id: existingProfile.id, linkedinUrl },
                data: {
                    name,
                    location,
                    industry,
                    size,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Créer un nouveau profil
            return this.prisma.organizationProfile.create({
                data: {
                    linkedinUrl,
                    name,
                    location,
                    industry,
                    size,
                    profileList: { connect: { id: listId } },
                },
            });
        }
    }
}
