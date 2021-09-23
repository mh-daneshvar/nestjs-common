import { PublishingQueueInterface } from './strategies/rabbitmq/interfaces/queue.interface';

export default interface MessageBrokerInterface {
  setup();
  publish(publishingQueue: PublishingQueueInterface, messageContent: any);
}
