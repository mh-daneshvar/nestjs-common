export interface ListeningQueueInterface {
  service: string;
  event: string;
  version: string;
  exchangeName: string;
  handler: (message: any) => any;
}

export interface PublishingQueueInterface {
  event: string;
  version: string;
  exchangeName: string;
  configs: {
    durable: boolean;
    noAck: boolean;
    exclusive: boolean;
    auto_delete: boolean;
    persistent: boolean;
  };
}
