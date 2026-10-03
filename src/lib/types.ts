export const BIKE_STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN'] as const;
export type BikeStatus = (typeof BIKE_STATUSES)[number];
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'] as const;
export const TRANSMISSIONS = ['Manual', 'Automatic'] as const;
export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'CLOSED'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface BikeImage {
  id: string;
  bike_id: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface Bike {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  slug: string;
  price: number;
  year: number;
  km_driven: number;
  fuel_type: string;
  transmission: string;
  owner_count: number;
  registration_number: string | null;
  condition: string | null;
  location: string | null;
  description: string | null;
  status: BikeStatus;
  featured: boolean;
  new_arrival?: boolean;
  created_at: string;
  updated_at: string;
  bike_images?: BikeImage[];
}

export interface Enquiry {
  id: string;
  bike_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
  bikes?: { brand: string; model: string; slug: string } | null;
}

export interface SellRequest {
  id: string;
  customer_name: string;
  phone: string;
  brand: string;
  model: string;
  year: number;
  km_driven: number;
  expected_price: number | null;
  description: string | null;
  photos: string[];
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}
