export type VehicleCategory = 'hatchback' | 'sedan' | 'suv' | 'luxury_suv' | 'luxury';

export interface VehicleOption {
  id: VehicleCategory;
  name: string;
  example: string;
  icon: string;
  multiplier: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  duration: string;
  popular?: boolean;
  features: string[];
  recommendedFor: string;
}

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  iconName: string;
}

export interface BookingFormData {
  vehicleType: VehicleCategory;
  vehicleModel: string;
  vehicleNumber: string;
  serviceId: string;
  addons: string[];
  pickupAddress: string;
  pickupPincode: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  vehicle: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}
