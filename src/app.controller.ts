import {
  CacheInterceptor,
  Controller,
  Get,
  // Inject,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerResponse } from './common/response-decorator/responses.interface';
import {
  // ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, // @Inject('MATH_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async getHello(): Promise<ControllerResponse> {
    return {
      data: {
        hello: await this.appService.getHello(),
      },
    };
  }

  @MessagePattern('hello')
  @EventPattern('hello')
  async something(@Payload() data: number[], @Ctx() context: RmqContext) {
    // eslint-disable-next-line no-console
    console.log(`Pattern: ${context.getPattern()}`);
    // eslint-disable-next-line no-console
    console.log(`Payload: ${data}`);
    // eslint-disable-next-line no-console
    console.log('------------------------>');
  }
}
