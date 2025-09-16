import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import Joi from 'joi';

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
            }),
        }),
        PrismaModule,
    ],
    controllers: [AppController, AuthController],
    providers: [AppService, UserService, PrismaService],
})
export class AppModule {}
