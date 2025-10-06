import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import cookieParser from 'cookie-parser';

export interface ValidationPipeOptions extends ValidatorOptions {
    transform?: boolean;
    disableErrorMessages?: boolean;
    exceptionFactory?: (errors: ValidationError[]) => any;
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.enableCors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] });
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
