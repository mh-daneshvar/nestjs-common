import { InternalServerErrorException, Module } from '@nestjs/common';
import RabbitmqService from './strategies/rabbitmq/rabbitmq.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import MessageBrokerInterface from './MessageBroker.interface';

const ConnectionFactory = {
  provide: 'MessageBroker',
  useFactory: async (
    configService: ConfigService,
  ): Promise<MessageBrokerInterface> => {
    const configName = 'MESSAGE_BROKER';
    let requestedMessageBroker = configService.get<string>(configName);
    let messageBroker = null;
    if (requestedMessageBroker) {
      requestedMessageBroker = requestedMessageBroker.toLowerCase();
      if (requestedMessageBroker === 'rabbitmq') {
        messageBroker = new RabbitmqService(configService);
        await messageBroker.setup();
      } else {
        throw new InternalServerErrorException(
          `Check the value of the '${configName}' configuration attribute`,
        );
      }
    }
    return messageBroker;
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
