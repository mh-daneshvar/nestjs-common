export default interface MessageBrokerInterface {
  setup();
  publish(routingKey: string, messageContent: any, exchangeName?: string);
}
