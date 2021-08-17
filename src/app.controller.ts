import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerResponse } from './common/response-decorator/responses.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<ControllerResponse> {
    return {
      data: this.appService.getHello(),
    };
  }
}
