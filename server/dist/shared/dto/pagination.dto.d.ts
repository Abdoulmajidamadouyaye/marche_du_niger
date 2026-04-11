export declare class PaginationQueryDto {
    limit?: number;
    skip?: number;
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    total: number;
    count: number;
    skip: number;
    limit: number;
}
