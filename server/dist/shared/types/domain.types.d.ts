export type PaymentMethod = 'card' | 'mynita' | 'amana' | 'cod';
export type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'shipped' | 'delivered' | 'cancelled';
export type VehicleCondition = 'neuf' | 'occasion';
export type MotoType = 'Sport' | 'Cross' | 'Scooter' | 'Routière' | 'Autre';
export type MotoEngineType = '2 temps' | '4 temps';
export type MotoUsage = 'ville' | 'route' | 'tout-terrain';
export type MotoBreaks = 'disque' | 'tambour' | 'disque + tambour';
export interface MotoSpecs {
    brand: string;
    model: string;
    year: number;
    motoType: MotoType;
    engineType: MotoEngineType;
    maxSpeed: number;
    weight: number;
    color: string;
    tireType: string;
    mileage: number;
    usage: MotoUsage;
    fuelConsumption: number;
    tankCapacity: number;
    brakes: MotoBreaks;
    antiTheft: boolean;
    ledLighting: boolean;
    electricStart: boolean;
    digitalDashboard: boolean;
    condition: VehicleCondition;
    papersAvailable: boolean;
}
export interface VehicleSpecs {
    brand: string;
    model: string;
    year: number;
    engineType: 'Essence' | 'Diesel' | 'Hybride' | 'Electrique';
    horsepower: number;
    transmission: 'Automatique' | 'Manuelle';
    fuelConsumption: number;
    autonomy: number;
    tankCapacity: number;
    mileage: number;
    doors: number;
    seats: number;
    color: string;
    airbags: boolean;
    abs: boolean;
    reverseCamera: boolean;
    airConditioning: boolean;
    gpsNavigation: boolean;
    touchScreen: boolean;
    condition: VehicleCondition;
    papersAvailable: boolean;
}
export interface ProductEntity {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    inStock: boolean;
    category: string;
    categorySlug: string;
    sizes?: string[];
    colors: string[];
    images: Record<string, string>;
    vehicleSpecs?: VehicleSpecs;
    motoSpecs?: MotoSpecs;
    country?: string;
    regions?: string[];
    shippingDelayDays?: number;
    createdAt: string;
    updatedAt: string;
}
export interface OrderItemEntity {
    productId: string;
    productName: string;
    productImage?: string;
    unitPrice: number;
    quantity: number;
}
export interface OrderEntity {
    id: string;
    items: OrderItemEntity[];
    subtotal: number;
    paymentMethod: PaymentMethod;
    customerFirstName?: string;
    customerLastName?: string;
    customerPhone?: string;
    customerCity?: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}
export interface OrdersPerDayEntity {
    date: string;
    count: number;
}
export interface TopProductEntity {
    productId: string;
    productName: string;
    quantity: number;
}
export interface ActiveCityEntity {
    city: string;
    count: number;
}
export interface OrdersAnalyticsEntity {
    ordersPerDay: OrdersPerDayEntity[];
    topProducts: TopProductEntity[];
    activeCities: ActiveCityEntity[];
}
export interface CustomerEntity {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}
export interface AdminAuthPayload {
    sub: string;
    email: string;
    role: 'admin';
}
export interface CustomerAuthPayload {
    sub: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    role: 'customer';
}
