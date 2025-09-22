import { Module } from '@nestjs/common';
import { OrganizationProfileService } from './organization-profile.service';
import { OrganizationProfileController } from './organization-profile.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [OrganizationProfileService, PrismaService],
    controllers: [OrganizationProfileController],
})
export class OrganizationProfileModule {}
