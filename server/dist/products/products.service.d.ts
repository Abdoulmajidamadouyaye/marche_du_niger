import { ProductEntity } from '../shared/types/domain.types';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SetPromotionDto } from './dto/set-promotion.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedResponseDto } from '../shared/dto/pagination.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(category?: string): Promise<ProductEntity[]>;
    findAllPaginated(category?: string, limit?: number, skip?: number): Promise<PaginatedResponseDto<ProductEntity>>;
    findOne(id: string): Promise<ProductEntity>;
    create(dto: CreateProductDto): Promise<ProductEntity>;
    update(id: string, dto: UpdateProductDto): Promise<ProductEntity>;
    remove(id: string): Promise<{
        deleted: true;
        id: string;
    }>;
    setPromotion(id: string, dto: SetPromotionDto): Promise<ProductEntity>;
    clearPromotion(id: string): Promise<ProductEntity>;
    search(query: string, limit?: number, skip?: number): Promise<{
        items: ProductEntity[];
        total: number;
    }>;
    private toEntity;
}
