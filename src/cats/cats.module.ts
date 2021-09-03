import { Module } from '@nestjs/common';
import CatsService from './cats.service';
import DogsService from './dogs.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    DogsService,
    {
      provide: CatsService,
      useFactory: (configService: DogsService) => {
        return new CatsService(configService.getDogsName());
      },
      inject: [DogsService],
    },
  ],
  exports: [CatsService],
})
export class CatsModule {}
