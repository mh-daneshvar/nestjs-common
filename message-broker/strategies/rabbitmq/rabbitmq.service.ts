import * as amqplib from 'amqplib';
import Exchanges from './constants/exchanges';
import Queues from './constants/queues';
import { ConfigService } from '@nestjs/config';
import MessageBrokerInterface from '../../MessageBroker.interface';
import ExchangeInterface from './interfaces/exchange.interface';
import {
  ListeningQueueInterface,
  PublishingQueueInterface,
} from './interfaces/queue.interface';

export default class RabbitmqService implements MessageBrokerInterface {
  private connection: amqplib.Connection;

  private readonly configs: {
    rabbitAddress: string;
    exchanges: ExchangeInterface[];
    listeningQueues: ListeningQueueInterface[];
    publishingQueues: PublishingQueueInterface[];
  };

  /**
   * Constructor
   * In constructor, we set all required configurations such as:
   *  - server address
   *  - exchanges
   *  - queues
   *
   */
  constructor(configService: ConfigService) {
    this.configs = {
      rabbitAddress: configService.get<string>('RABBITMQ_SERVER_ADDRESS'),
      exchanges: Exchanges.filter((exchange) => exchange.name),
      listeningQueues: Queues.listening.filter((queue) => queue && queue.name),
      publishingQueues: Queues.publishing.filter(
        (queue) => queue && queue.name,
      ),
    };
  }

  /**
   * Setup exchanges and queues
   *
   * @private
   */
  public async setup(): Promise<MessageBrokerInterface> {
    // 1. Connect to the RabbitMQ instance
    this.connection = await amqplib.connect(this.configs.rabbitAddress);

    // 2. Create a channel
    const channel = await this.connection.createChannel();

    // 3. Setup exchanges
    for (const exchangeInfo of this.configs.exchanges) {
      await channel.assertExchange(exchangeInfo.name, exchangeInfo.type, {
        durable: exchangeInfo.durable,
      });
    }

    // 4. Setup listeners
    for (const queueInfo of this.configs.listeningQueues) {
      const { name, handler } = queueInfo;

      // Subscribe on the queue and register the handler
      await channel.consume(name, async function (message) {
        try {
          await handler(message);
          channel.ack(message);
        } catch (e) {}
      });
    }

    // 5. Setup publishers
    for (const queueInfo of this.configs.publishingQueues) {
      const { name, routingKey, exchangeName } = queueInfo;

      // Setup the queue
      await channel.assertQueue(name);

      // Bind the queue to the given exchange
      await channel.bindQueue(name, exchangeName, routingKey);
    }

    return this;
  }

  /**
   * Use this method for publishing new message in the given queue
   *
   * @param routingKey
   * @param messageContent
   * @param exchangeName
   */
  public async publish(
    routingKey: string,
    messageContent: Record<string, unknown>,
    exchangeName?: string,
  ) {
    const channel = await this.connection.createChannel();

    const publishingQueues = this.configs.publishingQueues.filter((queue) => {
      if (exchangeName && queue.name === routingKey) {
        return true;
      } else if (queue.name === routingKey) {
        return true;
      }
    });

    for (const publishingQueue of publishingQueues) {
      const { exchangeName, routingKey, persistent } = publishingQueue;
      channel.publish(
        exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(messageContent)),
        {
          contentType: 'application/json',
          persistent,
        },
      );
      await channel.close();
    }
  }
}
