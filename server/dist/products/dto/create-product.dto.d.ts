declare class VehicleSpecsDto {
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
    condition: 'neuf' | 'occasion';
    papersAvailable: boolean;
}
declare class MotoSpecsDto {
    brand: string;
    model: string;
    year: number;
    motoType: 'Sport' | 'Cross' | 'Scooter' | 'Routière' | 'Autre';
    engineType: '2 temps' | '4 temps';
    maxSpeed: number;
    weight: number;
    color: string;
    tireType: string;
    mileage: number;
    usage: 'ville' | 'route' | 'tout-terrain';
    fuelConsumption: number;
    tankCapacity: number;
    brakes: 'disque' | 'tambour' | 'disque + tambour';
    antiTheft: boolean;
    ledLighting: boolean;
    electricStart: boolean;
    digitalDashboard: boolean;
    condition: 'neuf' | 'occasion';
    papersAvailable: boolean;
}
export declare class CreateProductDto {
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    category: string;
    categorySlug?: string;
    sizes?: string[];
    colors: string[];
    images: Record<string, string>;
    inStock?: boolean;
    vehicleSpecs?: VehicleSpecsDto;
    motoSpecs?: MotoSpecsDto;
    country?: string;
    regions?: string[];
    shippingDelayDays?: number;
}
export {};
