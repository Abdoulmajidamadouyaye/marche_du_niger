import { OrderEntity, ProductEntity } from '../types/domain.types';
export declare class DataStoreService {
    private readonly storePath;
    products: ProductEntity[];
    orders: OrderEntity[];
    constructor();
    save(): void;
    private load;
}
