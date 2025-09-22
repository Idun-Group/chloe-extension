import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PeopleProfileService {
    constructor(private prisma: PrismaService) {}

    async createPeopleProfile(
        profileListId: string,
        linkedinUrl: string,
        fullName: string,
        location: string,
        job: string | undefined,
        phone: string | undefined,
        email: string | undefined,
    ) {
        // Vérifier si le profil existe déjà
        const existingProfile = await this.prisma.peopleProfile.findFirst({
            where: {
                profileListId,
                linkedinUrl,
            },
        });

        if (existingProfile) {
            // Mettre à jour le profil existant
            return this.prisma.peopleProfile.update({
                where: { id: existingProfile.id },
                data: {
                    fullName,
                    location,
                    job,
                    phone,
                    email,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Créer un nouveau profil
            return this.prisma.peopleProfile.create({
                data: {
                    linkedinUrl,
                    job,
                    fullName,
                    location,
                    phone,
                    email,
                    profileList: { connect: { id: profileListId } },
                },
            });
        }
    }

    async getPeopleProfileById(id: string) {
        return this.prisma.peopleProfile.findUnique({
            where: { id },
        });
    }

    async getAllPeopleProfiles() {
        return this.prisma.peopleProfile.findMany();
    }

    async updatePeopleProfile(
        id: string,
        linkedinUrl: string | undefined,
        job: string | undefined,
        fullName: string | undefined,
        location: string | undefined,
        phone: string | undefined,
        email: string | undefined,
    ) {
        return this.prisma.peopleProfile.update({
            where: { id },
            data: {
                linkedinUrl,
                job,
                fullName,
                location,
                phone,
                email,
            },
        });
    }

    async deletePeopleProfile(id: string) {
        return this.prisma.peopleProfile.delete({
            where: { id },
        });
    }
}
