import { Module } from '@nestjs/common';
import { PeopleProfileService } from './people-profile.service';
import { PeopleProfileController } from './people-profile.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PeopleProfileController],
    providers: [PeopleProfileService],
    exports: [PeopleProfileService],
})
export class PeopleProfileModule {}
