import { DynamicModule, Module } from '@nestjs/common';
import { ResponseDecorator } from './responseDecorator.interceptor';
import { ConfigModule } from '@nestjs/config';

@Module({})
export class ResponseDecoratorModule {
  static register(): DynamicModule {
    return {
      imports: [ConfigModule],
      module: ResponseDecoratorModule,
      providers: [ResponseDecorator],
      exports: [ResponseDecorator],
    };
  }
}
