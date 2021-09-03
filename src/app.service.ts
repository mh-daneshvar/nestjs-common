import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import CatsService from './cats/cats.service';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly catsService: CatsService,
  ) {}

  async getHello(): Promise<any> {
    this.catsService.doSomething();
    const salam = Date.now();
    if (!salam) {
      await this.cacheManager.set('key', 'fuck this world');
      return 'Hello World!';
    }
    return salam;
  }
}
