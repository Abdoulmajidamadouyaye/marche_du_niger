export type PaymentMethod = "card" | "mynita" | "amana" | "cod";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_delivery"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Country = "niger" | "benin";

export type VehicleCondition = "neuf" | "occasion";

export type MotoType = "Sport" | "Cross" | "Scooter" | "Routière" | "Autre";
export type MotoEngineType = "2 temps" | "4 temps";
export type MotoUsage = "ville" | "route" | "tout-terrain";
export type MotoBreaks = "disque" | "tambour" | "disque + tambour";

export type MotoSpecs = {
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
};

export type VehicleSpecs = {
  brand: string;
  model: string;
  year: number;
  engineType: "Essence" | "Diesel" | "Hybride" | "Electrique";
  horsepower: number;
  transmission: "Automatique" | "Manuelle";
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
};

export type ProductType = {
  id: string | number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  inStock?: boolean;
  category: string;
  categorySlug: string;
  sizes?: string[];
  colors: string[];
  images: Record<string, string>;
  vehicleSpecs?: VehicleSpecs;
  motoSpecs?: MotoSpecs;
  country?: Country;
  regions?: string[];
  shippingDelayDays?: number;
};

export type ProductsType = ProductType[];

export type CartItemType = {
  product: ProductType;
  quantity: number;
};

export type OrderItemType = {
  productId: string;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
};

export type OrderType = {
  id: string;
  items: OrderItemType[];
  subtotal: number;
  paymentMethod: PaymentMethod;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerCity?: string;
  status: OrderStatus;
  createdAt: string;
};

export type OrdersPerDayType = {
  date: string;
  count: number;
};

export type TopProductType = {
  productId: string;
  productName: string;
  quantity: number;
};

export type ActiveCityType = {
  city: string;
  count: number;
};

export type OrdersAnalyticsType = {
  ordersPerDay: OrdersPerDayType[];
  topProducts: TopProductType[];
  activeCities: ActiveCityType[];
};

export type CustomerType = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatSenderRole = "customer" | "admin";

export type ChatMessageType = {
  id: string;
  customerId: string;
  senderName: string;
  senderRole: ChatSenderRole;
  message: string;
  createdAt: string;
};

export type ConversationSummaryType = {
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastAt: string;
  lastSenderRole: ChatSenderRole;
};

export type CategoryType = {
  name: string;
  icon: React.ReactNode;
  slug: string;
}[];