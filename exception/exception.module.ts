import { DynamicModule, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './httpException.filter';

@Module({})
export class ExceptionModule {
  static register(): DynamicModule {
    return {
      module: ExceptionModule,
      providers: [HttpExceptionFilter],
      exports: [HttpExceptionFilter],
    };
  }
}
