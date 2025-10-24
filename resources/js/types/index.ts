import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Setting {
    nama_app: string;
    logo?: string;
    warna?: string;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
    registration_enabled: boolean; // Added this line
  }
  
  export interface SharedData {
      name: string;
      quote: { message: string; author: string };
      auth: Auth;
      setting?: Setting;
      [key: string]: unknown;
  }

export interface Division {
    id: number;
    name: string;
}

export interface AssetCategory {
    id: number;
    name: string;
    description?: string | null;
    custom_fields_schema?: Record<string, unknown> | null;
    brands?: Brand[]; // Add brands relationship
}

export interface Brand { // New interface for Brand
    id: number;
    name: string;
}

export interface Asset { // New interface for Asset
    id: number;
    asset_category_id: number;
    user_id: number | null;
    serial_number: string | null;
    brand: string | null;
    model: string | null;
    purchase_date: string | null; // YYYY-MM-DD
    warranty_end_date: string | null; // YYYY-MM-DD
    status: 'available' | 'assigned' | 'in_repair' | 'retired';
    notes: string | null;
    custom_fields_data: Record<string, unknown> | null;
    last_used_at: string | null; // Human readable diffForHumans
    created_at: string; // Human readable diffForHumans
    category?: AssetCategory; // Eager loaded relationship
    user?: User; // Eager loaded relationship
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    nik?: string | null;
    personal_email?: string | null;
    phone_number?: string | null;
    address?: string | null;
    manager_id?: number | null;
    manager?: User | null;
    division_id?: number | null;
    division?: Division | null;
    [key: string]: unknown;
}

export interface Permission {
    id: number;
    name: string;
    group?: string | null;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
  }