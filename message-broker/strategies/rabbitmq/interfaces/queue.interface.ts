export default interface QueueInterface {
  exchangeName: string;
  name: string;
  bindingKey: string;
  durable: boolean;
  noAck: boolean;
  exclusive: boolean;
  auto_delete: boolean;
  handler: (message: any) => any;
}
