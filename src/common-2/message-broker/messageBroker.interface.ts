export default interface MessageBrokerInterface {
  setup();
  publish(exchangeName: string, routingKey: string, messageContent: string);
}
