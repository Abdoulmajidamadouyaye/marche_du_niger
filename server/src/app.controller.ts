import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  home() {
    return {
      message: 'API Marché du Niger fonctionne 🚀',
    };
  }
}