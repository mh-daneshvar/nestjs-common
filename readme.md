version: 0.0.7

#### good resource:

```https://docs.github.com/en/get-started/using-git/about-git-subtree-merges```

#### update service with the last version of "master"

```git pull -s subtree common master```

#### update subtree from the main project

```git push common `git subtree split --prefix=src/common`:master --force```

## About RabbitMQ

Put these two files into [root-of-project]/configs/message-broker/rabbitmq:
- exchanges.ts
- queues.ts

samples of exchanges.ts:
```
const Exchanges = [
  {
    name: 'nestjs-boilerplate-exchange',
    type: 'topic',
    durable: true,
  },
];

export default Exchanges;
```
samples of queues.ts:
```
const Queues = {
  listening: [
     {
       exchangeName: 'nestjs-boilerplate-exchange',
       service: 'nestjs-boilerplate',
       event: 'user.add',
       version: '1',
       handler: async (message) => {
         if (message && message.content) {
           const stringMsg = JSON.parse(message.content);
           console.info('----------->');
           console.info(stringMsg);
           console.info('----------->');
           // message.ack();
         } else {
           throw new InternalServerErrorException('something...');
         }
       },
     },
  ],
  publishing: [
    {
      event: 'user.add',
      version: '1',
      exchangeName: 'nestjs-boilerplate-exchange',
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
      exchangeName: 'nestjs-boilerplate-exchange',
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
```

