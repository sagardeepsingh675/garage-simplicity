
import { BusinessSettings } from "@/services/businessSettingsService";

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  inventory_item_id?: string;
}

export interface InvoiceService {
  id?: string;
  name: string;
  hours: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  customer_id: string;
  job_card_id?: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  due_date?: string;
  payment_date?: string;
  payment_method?: string;
  status: InvoiceStatus;
  notes?: string;
  parts?: InvoiceItem[];
  services?: InvoiceService[];
  invoice_number?: string;
  vehicle_damage_image?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithRelations extends Invoice {
  customers?: {
    name: string;
    phone?: string;
    email?: string;
  };
  job_cards?: {
    id: string;
    issue_description?: string;
    vehicles?: {
      id: string;
      make: string;
      model: string;
      license_plate?: string;
      year?: number;
    }
  };
}

export interface PrintInvoiceData {
  invoice: Invoice;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  businessSettings: BusinessSettings | null;
}

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
