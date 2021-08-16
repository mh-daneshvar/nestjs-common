import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const jafar = '123456';
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
