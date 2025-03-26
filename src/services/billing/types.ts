
import { SupabaseData } from "../types";

export type Invoice = {
  id: string;
  customer_id: string;
  vehicle_id: string;
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
  services: { name: string; cost: number }[];
  parts: { name: string; quantity: number; cost: number }[];
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
}
