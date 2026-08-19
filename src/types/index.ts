export type VehicleCategory = 'hatchback' | 'sedan' | 'suv' | 'luxury_suv' | 'luxury' | 'bike' | 'auto' | 'commercial' | 'custom';

export interface VehicleOption {
  id: VehicleCategory;
  name: string;
  example: string;
  icon: string;
  multiplier: number;
}

export interface WashServiceItem {
  id: string;
  name: string;
  category: 'exterior' | 'interior' | 'engine' | 'protective';
  price: number;
  durationMinutes: number;
  description: string;
  iconName: string;
  popular?: boolean;
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
  serviceIds?: string[];
}

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  iconName: string;
}

export interface BookingFormData {
  vehicleType: string;
  vehicleModel: string;
  vehicleNumber: string;
  serviceId: string;
  selectedServices?: string[];
  addons: string[];
  pickupAddress: string;
  pickupPincode: string;
  distanceKm?: number;
  date: string;
  timeSlot?: string;
  inTime?: string;
  outTime?: string;
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

export interface BookingRecord {
  id: string;
  createdAt: string;
  vehicleCategory: string;
  vehicleModel: string;
  vehicleNumber: string;
  serviceId: string;
  serviceName: string;
  selectedServices: string[];
  serviceNames: string[];
  addons: string[];
  addonNames: string[];
  totalPrice: number;
  totalDurationMinutes: number;
  pickupAddress: string;
  pickupPincode: string;
  distanceKm: number;
  date: string;
  inTime: string;
  outTime: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  status: 'Confirmed' | 'Driver Assigned' | 'In Washing' | 'Completed';
}
