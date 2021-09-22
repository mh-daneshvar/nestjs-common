import { InternalServerErrorException } from '@nestjs/common';

const Queues = {
  requests: {
    name: 'requests',
    bindingKey: 'request',
    exchangeName: 'processing',
    durable: true,
    noAck: false,
    exclusive: false,
    auto_delete: true,
    handler: async (message) => {
      if (message && message.content) {
        const stringMsg = message.content.toString();
        console.info('----------->');
        console.info(stringMsg);
        console.info('----------->');
      } else {
        throw new InternalServerErrorException('something...');
      }
    },
  },
  results: {
    name: 'results',
    bindingKey: 'result',
    exchangeName: 'processing',
    durable: true,
    noAck: false,
    exclusive: false,
    auto_delete: true,
    handler: async (message: any) => {
      console.info('----------->');
      console.info(message);
      console.info('----------->');
      // Todo: do something
    },
  },
};

export default Queues;
