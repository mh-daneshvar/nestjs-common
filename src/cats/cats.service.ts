import { Injectable } from '@nestjs/common';

@Injectable()
export default class CatsService {
  constructor(private readonly dogsName: string) {
    // eslint-disable-next-line no-console
    console.log('------------------------>');
    // eslint-disable-next-line no-console
    console.log('debugging:\n', JSON.stringify('constructor', null, 2));
    // eslint-disable-next-line no-console
    console.log('------------------------>');
  }

  public doSomething() {
    // eslint-disable-next-line no-console
    console.log('------------------------>');
    // eslint-disable-next-line no-console
    console.log('debugging:\n', JSON.stringify('do something', null, 2));
    // eslint-disable-next-line no-console
    console.log('debugging:\n', JSON.stringify(this.dogsName, null, 2));
    // eslint-disable-next-line no-console
    console.log('------------------------>');
  }
}
