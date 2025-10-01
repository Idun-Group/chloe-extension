import { Module } from '@nestjs/common';
import { ProfileListService } from './profile-list.service';
import { ProfileListController } from './profile-list.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DataConverterModule } from 'src/data-converter/data-converter.module';
import { DataConverterService } from 'src/data-converter/data-converter.service';

@Module({
    imports: [PrismaModule, DataConverterModule],
    providers: [ProfileListService, DataConverterService],
    controllers: [ProfileListController],
    exports: [ProfileListService],
})
export class ProfileListModule {}
