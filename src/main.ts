import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseDecorator } from './common/response-decorator/responseDecorator.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseDecorator());

  // Load ConfigService
  const servicePort = app.get(ConfigService).get<string>('SERVICE_PORT');

  await app.listen(servicePort);
}

bootstrap();
