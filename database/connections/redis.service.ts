import * as bluebird from 'bluebird';
import { RedisClient } from 'redis';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import * as redis from 'redis';
import { configService } from '../../../config.service';

export default class RedisService {
  private static readonly logger = new Logger(RedisService.name);

  /**
   * Create and return a redis-client object
   *
   */
  static getClient(): RedisClient {
    // Promisify all interactions with redis using bluebird package
    bluebird.promisifyAll(redis);
    try {
      const redisClient = redis.createClient(
        RedisService.getConnectionConfigs(),
      );

      // Log a message when connection had been established successfully
      redisClient.on('connect', function () {
        // TODO:
        // We can do something in this section, but at this time we don't need
        // RedisService.logger.log('Connected to Redis Successfully');
      });

      // Log occurred-error when we have any connection-issue
      redisClient.on('error', function () {
        RedisService.logger.error('Could not Connect to Redis!');
      });

      return redisClient;
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not Connect to Redis Server!',
      );
    }
  }

  /**
   *
   * @param consumer
   */
  private static getConnectionConfigs(consumer?: 'bull'): {
    port: number;
    host: string;
    password: string;
    no_ready_check?: boolean;
    connect_timeout?: number; // in milliseconds
    // eslint-disable-next-line @typescript-eslint/ban-types
    tls?: {};
  } {
    if (consumer === 'bull') {
      return {
        port: configService.get<number>('REDIS_PORT'),
        host: configService.get<string>('REDIS_HOST'),
        password: configService.get<string>('REDIS_PASSWORD'),
        tls:
          configService.get<string>('REDIS_TLS') === 'enable' ? {} : undefined,
      };
    }
    return {
      port: configService.get<number>('REDIS_PORT'),
      host: configService.get<string>('REDIS_HOST'),
      password: configService.get<string>('REDIS_PASSWORD'),
      no_ready_check: true,
      connect_timeout: 5000,
      tls: configService.get<string>('REDIS_TLS') === 'enable' ? {} : undefined,
    };
  }
}
