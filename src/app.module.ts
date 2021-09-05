import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MessageBrokerModule } from './common/message-broker/messageBroker.module';

@Module({
  imports: [
    MessageBrokerModule,
    ConfigModule.forRoot(),
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
