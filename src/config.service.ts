import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

class AppConfig extends ConfigService {
  /**
   *
   * @param env
   */
  constructor(private env: { [k: string]: string | undefined }) {
    super();
  }

  /**
   *
   * @param key
   * @param throwOnMissing
   */
  private getValue(key: string, throwOnMissing = true): any {
    const value = this.get(key);
    if (!value && throwOnMissing) {
      throw new InternalServerErrorException(
        `config error - missing env.${key}`,
      );
    }
    return value;
  }

  /**
   *
   * @param keys
   */
  public ensureValues(keys: string[]): AppConfig {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  /**
   *
   */
  public getTypeOrmConfig(): any {
    const config: any = {
      type: 'postgres',
      host: this.getValue('DATABASE_HOST'),
      port: parseInt(this.getValue('DATABASE_PORT')),
      username: this.getValue('DATABASE_USER'),
      password: this.getValue('DATABASE_PASSWORD'),
      database: this.getValue('DATABASE_DB'),
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrationsTableName: 'migrations',
      migrations: [join(__dirname, '../database', 'migration', '*.ts')],
      cli: {
        migrationsDir: './database/migration',
      },
      logging: JSON.parse(this.getValue('DATABASE_LOGGING')),
      synchronize: false,
      extra: {
        max: this.getValue('DATABASE_MAX_CONNECTIONS'),
        connectionTimeoutMillis: this.getValue(
          'DATABASE_MAX_CONNECTION_TIMEOUT_IN_MILLISECONDS',
        ),
      },
    };
    if (JSON.parse(this.getValue('DATABASE_CONNECTION_ENABLE_SSL'))) {
      config.ssl = { rejectUnauthorized: false };
    }
    return config;
  }
}

const configService = new AppConfig(process.env).ensureValues(['SERVICE_PORT']);

export { configService };
