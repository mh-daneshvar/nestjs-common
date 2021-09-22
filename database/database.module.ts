import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import RedisService from './connections/redis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from '../../config.service';
import { MongooseModule } from '@nestjs/mongoose';

const connectionFactory = (types: string[]) => {
  let redisInstance = null;
  if (types.includes('redis')) {
    redisInstance = RedisService.getClient();
  }

  return {
    provide: 'DatabaseConnectionProvider',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useFactory: async (configService: ConfigService): Promise<any> => {
      return {
        getRedisInstance: () => {
          return redisInstance;
        },
      };
    },
    inject: [ConfigService],
  };
};

@Module({})
export class DatabaseModule {
  static register(types: string[]): DynamicModule {
    const ConnectionFactory = connectionFactory(types);
    const providers = [ConnectionFactory];

    const imports: any[] = [ConfigModule];
    if (types.includes('postgres')) {
      imports.push(TypeOrmModule.forRoot(configService.getTypeOrmConfig()));
    }
    if (types.includes('mongodb')) {
      imports.push(MongooseModule.forRoot(configService.getMongoConfig()));
    }

    return {
      module: DatabaseModule,
      imports,
      providers,
      exports: ['DatabaseConnectionProvider'],
    };
  }
}
