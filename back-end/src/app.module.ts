import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: Joi.object({
                PORT: Joi.number().default(3000),
                FIREBASE_CLIENT_EMAIL: Joi.string().required(),
                FIREBASE_PRIVATE_KEY: Joi.string().required(),
                FIREBASE_PROJECT_ID: Joi.string().required(),
                LINKEDIN_CLIENT_ID: Joi.string().required(),
                LINKEDIN_CLIENT_SECRET: Joi.string().required(),
                LINKEDIN_REDIRECT_URI: Joi.string().required(),
            }),
        }),
    ],
    controllers: [AppController, AuthController],
    providers: [AppService],
})
export class AppModule {}
