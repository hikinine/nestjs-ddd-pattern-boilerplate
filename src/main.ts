import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger-builder.config';
import { TraceRequestInterceptor } from './lib/filters/trace-requests.filter';
import { classValidatorPipe } from './lib/pipes/class-validator.instance';
// Import your language translation files
import { CorsConfig } from './config/cors';
import { installGlobalI18nErrorModuleResolver } from './config/i18n-zod.resolver';

export async function bootstrap() {
  installGlobalI18nErrorModuleResolver();

  const app = await NestFactory.create(AppModule);

  const trace = new TraceRequestInterceptor();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  app.enableCors({
    origin: CorsConfig.origin,
    credentials: CorsConfig.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', ''],
  });

  app.use(cookieParser());
  app.useGlobalPipes(classValidatorPipe);
  app.useGlobalInterceptors(trace);

  SwaggerModule.setup('swagger', app, document);
  await app.listen(4000);
}
bootstrap();
