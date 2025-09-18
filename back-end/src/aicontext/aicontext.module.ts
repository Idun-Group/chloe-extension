import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AicontextService } from './aicontext.service';
import { AicontextController } from './aicontext.controller';

@Module({
    providers: [AicontextService, PrismaService],
    controllers: [AicontextController],
    exports: [AicontextService],
})
export class AicontextModule {}
