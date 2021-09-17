import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import RedisService from './connections/redis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../config.service';

const ConnectionFactory = (type: 'redis' | 'postgres') => {
  let redisInstance = null;
  let postgresInstance = null;
  if (type === 'redis') {
    redisInstance = RedisService.getClient();
  } else if (type === 'postgres') {
    postgresInstance = 'postgres instance';
  }

  return {
    provide: 'DatabaseConnectionProvider',
    useFactory: async (configService: ConfigService): Promise<any> => {
      configService.get<string>('DATABASE_PORT');
      return {
        getRedisInstance: () => {
          return redisInstance;
        },
        getPostgresInstance: () => {
          return postgresInstance;
        },
      };
    },
    inject: [ConfigService],
  };
};

@Module({})
export class DatabaseModule {
  static register(type: 'redis' | 'postgres'): DynamicModule {
    const providers = [ConnectionFactory(type)];
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
      ],
      providers,
      exports: ['DatabaseConnectionProvider'],
    };
  }
}
