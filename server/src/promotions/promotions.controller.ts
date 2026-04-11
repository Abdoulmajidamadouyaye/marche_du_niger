import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { SetPromotionDto } from '../products/dto/set-promotion.dto';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  listActivePromotions() {
    return this.promotionsService.listActivePromotions();
  }

  @Post(':productId')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  applyToProduct(@Param('productId') productId: string, @Body() dto: SetPromotionDto) {
    return this.promotionsService.applyToProduct(productId, dto);
  }

  @Delete(':productId')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  removeFromProduct(@Param('productId') productId: string) {
    return this.promotionsService.removeFromProduct(productId);
  }
}
