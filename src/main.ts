import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseDecorator } from './common/response-decorator/responseDecorator.interceptor';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Response Decorator
  app.useGlobalInterceptors(new ResponseDecorator());

  // Exception Handler
  app.useGlobalFilters(new HttpExceptionFilter());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Load ConfigService
  const servicePort = app.get(ConfigService).get<string>('SERVICE_PORT');

  await app.listen(servicePort);
}

bootstrap();
