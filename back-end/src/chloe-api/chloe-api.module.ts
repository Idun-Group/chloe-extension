import { Module } from '@nestjs/common';
import { ChloeApiController } from './chloe-api.controller';
import { ChloeApiService } from './chloe-api.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [ConfigModule, UserModule],
    controllers: [ChloeApiController],
    providers: [ChloeApiService],
})
export class ChloeApiModule {}
