import { Module } from '@nestjs/common';
import { ChloeApiController } from './chloe-api.controller';
import { ChloeApiService } from './chloe-api.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { ProfileListModule } from 'src/profile-list/profile-list.module';

@Module({
    imports: [ConfigModule, UserModule, ProfileListModule],
    controllers: [ChloeApiController],
    providers: [ChloeApiService],
})
export class ChloeApiModule {}
