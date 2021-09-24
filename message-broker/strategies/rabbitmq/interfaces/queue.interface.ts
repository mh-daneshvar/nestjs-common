export interface ListeningQueueInterface {
  name: string;
  exchangeName: string;
  handler: (message: any) => any;
}

export interface PublishingQueueInterface {
  name: string;
  routingKey: string;
  exchangeName: string;
  durable: boolean;
  noAck: boolean;
  exclusive: boolean;
  auto_delete: boolean;
  persistent: boolean;
}
