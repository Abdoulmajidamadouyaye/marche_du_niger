import { SetPromotionDto } from '../products/dto/set-promotion.dto';
import { PromotionsService } from './promotions.service';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    listActivePromotions(): Promise<import("../shared/types/domain.types").ProductEntity[]>;
    applyToProduct(productId: string, dto: SetPromotionDto): Promise<import("../shared/types/domain.types").ProductEntity>;
    removeFromProduct(productId: string): Promise<import("../shared/types/domain.types").ProductEntity>;
}
