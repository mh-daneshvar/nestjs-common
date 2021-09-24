const Queues = {
  listening: [],
  publishing: [
    {
      name: 'boilerplate.user.add.v1',
      routingKey: 'boilerplate.user.add.v1',
      exchangeName: 'messageBus',
      durable: true,
      noAck: true,
      exclusive: false,
      auto_delete: true,
      persistent: true,
    },
  ],
};

export default Queues;
