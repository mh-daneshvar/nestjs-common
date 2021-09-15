export default interface QueueInterface {
  name: string;
  bindingKey: string;
  durable: boolean;
  noAck: boolean;
  exclusive: boolean;
  auto_delete: boolean;
  exchangeName: string;
  handler: any;
}
