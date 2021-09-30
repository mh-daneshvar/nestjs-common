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
    serviceName: string;
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
      serviceName: configService.get<string>('SERVICE_NAME'),
      rabbitAddress: configService.get<string>('RABBITMQ_SERVER_ADDRESS'),
      exchanges: Exchanges.filter((exchange) => exchange.name),
      listeningQueues: Queues.listening.filter((queue) => queue && queue.event),
      publishingQueues: Queues.publishing.filter(
        (queue) => queue && queue.event,
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
      const { handler, exchangeName } = queueInfo;

      const bindingKey = this.getBindingKey(queueInfo);
      const listenerQueueName = `${this.configs.serviceName}-on-${bindingKey}`;

      // Setup the queue
      await channel.assertQueue(listenerQueueName);

      // Bind the queue to the given exchange
      await channel.bindQueue(listenerQueueName, exchangeName, bindingKey);

      console.info('\n');
      console.info('----------->');
      console.info(bindingKey);
      console.info('----------->');

      // Subscribe on the queue and register the handler
      await channel.consume(listenerQueueName, async function (message) {
        try {
          await handler(message);
          channel.ack(message);
        } catch (e) {}
      });
    }

    // 5. Setup publishers
    for (const queueInfo of this.configs.publishingQueues) {
      const { event, version, exchangeName } = queueInfo;

      const routingKey = this.getRoutingKey(event, version);

      // Setup the queue
      await channel.assertQueue(routingKey);

      // Bind the queue to the given exchange
      await channel.bindQueue(routingKey, exchangeName, routingKey);
    }

    return this;
  }

  /**
   * Use this method for publishing new message in the given queue
   *
   * @param event
   * @param version
   * @param messageContent
   * @param exchangeName
   */
  public async publish(
    event: string,
    version: string,
    messageContent: Record<string, unknown>,
    exchangeName?: string,
  ) {
    const channel = await this.connection.createChannel();

    const publishingQueues = this.configs.publishingQueues.filter((queue) => {
      if (exchangeName && queue.event === event && queue.version === version) {
        return true;
      } else if (queue.event === event && queue.version === version) {
        return true;
      }
    });

    for (const publishingQueue of publishingQueues) {
      const routingKey = this.getRoutingKey(event, version);
      const persistent = publishingQueue.configs.persistent;
      const exchangeName = publishingQueue.exchangeName;

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

  /**
   * Generate routing-key based on the given parameters
   *
   * @param event
   * @param version
   * @private
   */
  private getRoutingKey(event: string, version: string): string {
    return `${this.configs.serviceName}.${event}.v${version}`;
  }

  /**
   * Generate binding-key based on the given listening-queue-info
   *
   * @param queueInfo
   * @private
   */
  private getBindingKey(queueInfo: ListeningQueueInterface): string {
    const { service, event, version } = queueInfo;
    return `${service}.${event}.v${version}`;
  }
}
