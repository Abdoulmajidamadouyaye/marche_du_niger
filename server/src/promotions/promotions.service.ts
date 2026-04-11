import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { SetPromotionDto } from '../products/dto/set-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly productsService: ProductsService) {}

  async listActivePromotions() {
    const products = await this.productsService.findAll();
    return products.filter((product) => product.discountPercent);
  }

  async applyToProduct(productId: string, dto: SetPromotionDto) {
    return this.productsService.setPromotion(productId, dto);
  }

  async removeFromProduct(productId: string) {
    return this.productsService.clearPromotion(productId);
  }
}
