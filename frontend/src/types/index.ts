export interface DressCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
}

export interface DressImage {
  id: number;
  dress_id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: number | boolean;
  sort_order: number;
}

export interface Dress {
  id: number;
  category_id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  material: string | null;
  silhouette: string | null;
  style: string | null;
  color: string | null;
  rental_price: number;
  sale_price: number;
  video_url?: string | null;
  is_featured: number | boolean;
  status: string;
  meta_title?: string | null;
  meta_description?: string | null;
  category?: { id: number; name: string; slug: string };
  images?: DressImage[];
}

export interface ServiceItem {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_from: number;
  price_to: number;
  price_unit: string;
  duration_note: string | null;
  image: string | null;
  icon: string | null;
  is_featured: number | boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  status: string;
  published_at: string;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface ReviewItem {
  id: number;
  customer_name: string;
  service_used: string | null;
  rating: number;
  content: string;
  wedding_date: string | null;
}

export interface SlotAvailability {
  time_slot: string;
  available: boolean;
}

export interface NotificationLog {
  id: number;
  appointment_id: number;
  channel: 'zalo_zns' | 'sms' | 'email';
  recipient: string;
  status: 'sent' | 'simulated' | 'failed';
  payload?: string;
  response_message?: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  time_slot: string;
  service_id: number | null;
  dress_id: number | null;
  service_name?: string | null;
  dress_name?: string | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  estimated_revenue: number;
  created_at: string;
  notifications?: NotificationLog[];
}

export interface SiteSettings {
  [key: string]: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'staff';
}
