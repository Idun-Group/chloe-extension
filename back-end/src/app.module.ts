import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AicontextController } from './aicontext/aicontext.controller';
import { AicontextService } from './aicontext/aicontext.service';
import { AicontextModule } from './aicontext/aicontext.module';
import Joi from 'joi';
import { ProfileListController } from './profile-list/profile-list.controller';
import { ProfileListService } from './profile-list/profile-list.service';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: Joi.object({
                PORT: Joi.number().default(3000),
                LINKEDIN_CLIENT_ID: Joi.string().required(),
                LINKEDIN_CLIENT_SECRET: Joi.string().required(),
                LINKEDIN_REDIRECT_URI: Joi.string().required(),
                DATABASE_URL: Joi.string().required(),
                JWT_SECRET: Joi.string().default('super-secret'),
                JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
                JWT_REFRESH_EXPIRATION: Joi.string().default('30d'),
            }),
        }),
        PrismaModule,
        UserModule,
        AicontextModule,
    ],
    controllers: [
        AppController,
        AuthController,
        AicontextController,
        ProfileListController,
    ],
    providers: [
        AppService,
        UserService,
        PrismaService,
        AicontextService,
        ProfileListService,
    ],
})
export class AppModule {}
