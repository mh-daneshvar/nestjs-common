import * as amqplib from 'amqplib';
import Exchanges from './constants/exchanges';
import Queues from './constants/queues';
import { ConfigService } from '@nestjs/config';
import MessageBrokerInterface from '../../MessageBroker.interface';
import QueueInterface from './queue.interface';
import ExchangeInterface from './exchange.interface';

export default class RabbitmqService implements MessageBrokerInterface {
  private connection: amqplib.Connection;
  private readonly rabbitAddress: string;
  private readonly exchanges: ExchangeInterface[];
  private readonly queues: QueueInterface[];

  /**
   * Constructor
   *
   */
  constructor(configService: ConfigService) {
    this.rabbitAddress = configService.get<string>('RABBITMQ_SERVER_ADDRESS');
    this.exchanges = Object.getOwnPropertyNames(Exchanges).map(
      (exchange) => Exchanges[exchange],
    );
    this.queues = Object.getOwnPropertyNames(Queues).map(
      (queue) => Queues[queue],
    );
  }

  /**
   * Setup exchanges and queues
   *
   * @private
   */
  public async setup() {
    // Connect to RabbitMQ instance
    this.connection = await amqplib.connect(this.rabbitAddress);

    // Create a channel
    const channel = await this.connection.createChannel();

    // Create exchange
    for (const exchangeInfo of this.exchanges) {
      await channel.assertExchange(exchangeInfo.name, exchangeInfo.type, {
        durable: exchangeInfo.durable,
      });
    }

    // Setup queues
    for (const queueInfo of this.queues) {
      const queueCompleteName = `${queueInfo.exchangeName}.${queueInfo.name}`;
      // Create queue
      await channel.assertQueue(queueCompleteName, {
        durable: queueInfo.durable,
      });
      // Bind queue
      await channel.bindQueue(
        queueCompleteName,
        queueInfo.exchangeName,
        queueInfo.bindingKey,
      );
      // Subscribe on a queue and register the handler
      await channel.consume(queueCompleteName, queueInfo.handler, {
        noAck: queueInfo.noAck,
      });
    }

    console.log('Setup DONE');
  }

  /**
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
    channel.publish(
      exchangeName + '12',
      routingKey,
      Buffer.from(messageContent),
      {
        contentType: 'application/json',
        persistent: true,
      },
    );
    await channel.close();
  }
}
