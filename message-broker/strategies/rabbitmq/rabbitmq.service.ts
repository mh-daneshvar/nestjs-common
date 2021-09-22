import * as amqplib from 'amqplib';
import Exchanges from './constants/exchanges';
import Queues from './constants/queues';
import { ConfigService } from '@nestjs/config';
import MessageBrokerInterface from '../../MessageBroker.interface';
import QueueInterface from './interfaces/queue.interface';
import ExchangeInterface from './interfaces/exchange.interface';

export default class RabbitmqService implements MessageBrokerInterface {
  private connection: amqplib.Connection;

  private readonly configs: {
    rabbitAddress: string;
    exchanges: ExchangeInterface[];
    queues: QueueInterface[];
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
      exchanges: Object.getOwnPropertyNames(Exchanges).map(
        (exchange) => Exchanges[exchange],
      ),
      queues: Object.getOwnPropertyNames(Queues).map((queue) => Queues[queue]),
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

    // 4. Setup queues
    for (const queueInfo of this.configs.queues) {
      const queueCompleteName = `${queueInfo.exchangeName}.${queueInfo.name}`;
      // Setup the queue
      await channel.assertQueue(queueCompleteName, {
        durable: queueInfo.durable,
      });
      // Bind the queue to the given exchange
      await channel.bindQueue(
        queueCompleteName,
        queueInfo.exchangeName,
        queueInfo.bindingKey,
      );
      // Subscribe on the queue and register the handler
      await channel.consume(
        queueCompleteName,
        async function (message) {
          try {
            await queueInfo.handler(message);
            channel.ack(message);
          } catch (e) {}
        },
        {
          noAck: queueInfo.noAck,
        },
      );
    }

    return this;
  }

  /**
   * Use this method for publishing new message in the given queue
   *
   * @param exchangeName
   * @param routingKey
   * @param messageContent
   */
  public async publish(
    exchangeName: string,
    routingKey: string,
    messageContent: string,
  ) {
    const channel = await this.connection.createChannel();
    await channel.assertQueue('processing.requests', {
      durable: true,
    });
    channel.sendToQueue(
      'processing.requests',
      Buffer.from(messageContent.toString()),
      {
        contentType: 'application/json',
        persistent: true,
      },
    );
    // await channel.close();
  }
}
