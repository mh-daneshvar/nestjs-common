const Queues = {
  requests: {
    name: 'requests',
    bindingKey: 'request',
    exchangeName: 'processing',
    durable: true,
    noAck: true,
    exclusive: false,
    auto_delete: true,
    handler: (message) => {
      if (message !== null) {
        const msg = message.content.toString();
        console.log(msg);
      }
    },
  },
  results: {
    name: 'results',
    bindingKey: 'result',
    exchangeName: 'processing',
    durable: true,
    noAck: true,
    exclusive: false,
    auto_delete: true,
    handler: () => {
      // Todo: do something
    },
  },
};

export default Queues;
