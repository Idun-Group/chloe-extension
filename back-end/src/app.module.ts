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
import { PeopleProfileController } from './people-profile/people-profile.controller';
import { PeopleProfileModule } from './people-profile/people-profile.module';
import { ProfileListModule } from './profile-list/profile-list.module';
import { OrganizationProfileModule } from './organization-profile/organization-profile.module';
import { DataConverterModule } from './data-converter/data-converter.module';
import { StripeModule } from './stripe/stripe.module';
import { ChloeApiModule } from './chloe-api/chloe-api.module';

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

                STRIPE_SECRET_KEY: Joi.string().required(),

                CHLOE_API_SECRET_KEY: Joi.string().required(),
                CHLOE_API_URL: Joi.string().required(),
            }),
        }),
        PrismaModule,
        UserModule,
        AicontextModule,
        PeopleProfileModule,
        ProfileListModule,
        OrganizationProfileModule,
        DataConverterModule,
        StripeModule,
        ChloeApiModule,
    ],
    controllers: [
        AppController,
        AuthController,
        AicontextController,
        ProfileListController,
        PeopleProfileController,
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
