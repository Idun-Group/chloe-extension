import { Module } from '@nestjs/common';
import { ProfileListService } from './profile-list.service';
import { ProfileListController } from './profile-list.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ProfileListService],
    controllers: [ProfileListController],
})
export class ProfileListModule {}
