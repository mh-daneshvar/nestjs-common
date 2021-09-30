const Queues = {
  listening: [
    // {
    //   exchangeName: 'sigma-exchange',
    //   service: 'nestjs-boilerplate',
    //   event: 'user.add',
    //   version: '1',
    //   handler: async (message) => {
    //     if (message && message.content) {
    //       const stringMsg = JSON.parse(message.content);
    //       console.info('----------->');
    //       console.info(stringMsg);
    //       console.info('----------->');
    //       // message.ack();
    //     } else {
    //       throw new InternalServerErrorException('something...');
    //     }
    //   },
    // },
  ],
  publishing: [
    {
      event: 'user.add',
      version: '1',
      exchangeName: 'sigma-exchange',
      configs: {
        durable: true,
        noAck: true,
        exclusive: false,
        auto_delete: true,
        persistent: true,
      },
    },
    {
      event: 'user.update',
      version: '1',
      exchangeName: 'sigma-exchange',
      configs: {
        durable: true,
        noAck: true,
        exclusive: false,
        auto_delete: true,
        persistent: true,
      },
    },
  ],
};

export default Queues;
