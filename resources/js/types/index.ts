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
  }
  
  export interface SharedData {
      name: string;
      quote: { message: string; author: string };
      auth: Auth;
      setting?: Setting;
      [key: string]: unknown;
  }

export interface Division { // New interface for Division
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    nik?: string | null;
    personal_email?: string | null;
    phone_number?: string | null;
    address?: string | null;
    manager_id?: number | null;
    manager?: User | null; // Nested manager object
    division_id?: number | null;
    division?: Division | null; // Nested division object
    [key: string]: unknown; // This allows for additional properties...
}

export interface Permission {
    id: number;
    name: string;
    group?: string | null;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
  }