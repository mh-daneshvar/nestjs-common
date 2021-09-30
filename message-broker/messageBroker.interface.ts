export default interface MessageBrokerInterface {
  setup();
  publish(
    event: string,
    version: string,
    messageContent: any,
    exchangeName?: string,
  );
}
