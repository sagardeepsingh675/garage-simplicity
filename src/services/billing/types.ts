
import { SupabaseData } from "../types";

export type Invoice = {
  id: string;
  customer_id: string;
  job_card_id: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
  updated_at: string;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  services: { name: string; description?: string; cost: number }[];
  parts: { name: string; quantity: number; cost: number; inventory_item_id?: string }[];
  customers?: {
    name: string;
    phone: string;
    email: string;
  };
  job_cards?: {
    id: string;
    issue_description: string;
    vehicles?: {
      id: string;
      make: string;
      model: string;
      license_plate: string;
      year: number;
    }
  };
  // Add missing properties to match what's used in Billing.tsx
  invoice_number?: string;
  vehicle_damage_image?: string;
  // Add vehicle_id for type compatibility with existing code, but we won't send it to database
  vehicle_id?: string;
}

export type InvoiceFormData = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;

export type SupabaseInvoice = SupabaseData & {
  customers?: {
    name: string;
    phone: string;
    email: string;
  };
  job_cards?: {
    id: string;
    issue_description: string;
    vehicles?: {
      id: string;
      make: string;
      model: string;
      license_plate: string;
      year: number;
    }
  };
  // Add these properties to SupabaseInvoice as well
  invoice_number?: string;
  vehicle_damage_image?: string;
}
