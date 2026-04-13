import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'server',
        timestamp: '2026-04-13T12:00:00.000Z',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      service: 'server',
      timestamp: new Date().toISOString(),
    };
  }
}