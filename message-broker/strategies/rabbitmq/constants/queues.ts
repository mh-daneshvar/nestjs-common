import { InternalServerErrorException } from '@nestjs/common';

const Queues = {
  listening: {
    newUserIsAdded: {
      name: 'user.add',
      exchangeName: 'messageBus',
      handler: async (message) => {
        if (message && message.content) {
          const stringMsg = message.content.toString();
          console.info('new user is added -->');
          console.info(stringMsg);
          console.info('-------------------->');
        } else {
          throw new InternalServerErrorException('something...');
        }
      },
    },
  },
  publishing: {
    login: {
      name: 'login',
      routingKey: 'login',
      exchangeName: 'messageBus',
      durable: true,
      noAck: false,
      exclusive: false,
      auto_delete: true,
      persistent: true,
    },
  },
};

export default Queues;
