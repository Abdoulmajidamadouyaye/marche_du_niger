import { CreateProductDto } from './dto/create-product.dto';
import { SetPromotionDto } from './dto/set-promotion.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../shared/dto/pagination.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    listPaginated(paginationQuery: PaginationQueryDto, category?: string): Promise<PaginatedResponseDto<any>>;
    findAll(category?: string): Promise<import("../shared/types/domain.types").ProductEntity[]>;
    search(query: string, limit?: string, skip?: string): Promise<{
        items: import("../shared/types/domain.types").ProductEntity[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../shared/types/domain.types").ProductEntity>;
    create(dto: CreateProductDto): Promise<import("../shared/types/domain.types").ProductEntity>;
    update(id: string, dto: UpdateProductDto): Promise<import("../shared/types/domain.types").ProductEntity>;
    remove(id: string): Promise<{
        deleted: true;
        id: string;
    }>;
    setPromotion(id: string, dto: SetPromotionDto): Promise<import("../shared/types/domain.types").ProductEntity>;
    clearPromotion(id: string): Promise<import("../shared/types/domain.types").ProductEntity>;
}
