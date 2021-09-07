import { InternalServerErrorException, Module } from '@nestjs/common';
import RabbitmqService from './strategies/rabbitmq/rabbitmq.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import MessageBrokerInterface from './MessageBroker.interface';

const ConnectionFactory = {
  provide: 'MessageBroker',
  useFactory: async (
    configService: ConfigService,
  ): Promise<MessageBrokerInterface> => {
    const messageBroker = (
      configService.get<string>('MESSAGE_BROKER') || ''
    ).toLowerCase();
    if (messageBroker === 'rabbitmq') {
      return await new RabbitmqService(configService).setup();
    }
    throw new InternalServerErrorException(
      `Check the value of the 'MESSAGE_BROKER' configuration attribute`,
    );
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [ConnectionFactory],
  exports: ['MessageBroker'],
})
export class MessageBrokerModule {}
