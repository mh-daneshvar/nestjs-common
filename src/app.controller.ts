import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerResponse } from './common/response-decorator/responses.interface';
import { CreateUserDto } from './createUser.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ControllerResponse> {
    return {
      data: {
        hello: this.appService.getHello(),
        something: createUserDto,
      },
    };
  }
}
