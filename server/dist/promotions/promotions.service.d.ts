import { ProductsService } from '../products/products.service';
import { SetPromotionDto } from '../products/dto/set-promotion.dto';
export declare class PromotionsService {
    private readonly productsService;
    constructor(productsService: ProductsService);
    listActivePromotions(): Promise<import("../shared/types/domain.types").ProductEntity[]>;
    applyToProduct(productId: string, dto: SetPromotionDto): Promise<import("../shared/types/domain.types").ProductEntity>;
    removeFromProduct(productId: string): Promise<import("../shared/types/domain.types").ProductEntity>;
}
