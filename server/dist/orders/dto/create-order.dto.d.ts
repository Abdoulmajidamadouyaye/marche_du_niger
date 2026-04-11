declare class CreateOrderItemDto {
    productId: string;
    productName: string;
    productImage?: string;
    unitPrice: number;
    quantity: number;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    subtotal: number;
    paymentMethod: 'card' | 'mynita' | 'amana' | 'cod';
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    customerCity?: string;
}
export {};
