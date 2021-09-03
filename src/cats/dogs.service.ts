import { Injectable } from '@nestjs/common';

@Injectable()
export default class DogsService {
  constructor() {
    console.log('------------------------>');
    console.log('debugging:\n', JSON.stringify('constructor of dogs', null, 2));
    console.log('------------------------>');
  }

  public getDogsName() {
    return 'yek, do, se';
  }
}
