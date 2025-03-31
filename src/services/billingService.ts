import { supabase } from "@/integrations/supabase/client";
import { getBusinessSettings } from "@/services/businessSettingsService";

export type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

export type InvoiceService = {
  id: string;
  name: string;
  hours: number;
  rate: number;
  total: number;
};

export type Invoice = {
  id?: string;
  customer_id: string;
  job_card_id?: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  due_date?: string;
  payment_date?: string;
  payment_method?: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled';
  notes?: string;
  parts?: InvoiceItem[];
  services?: InvoiceService[];
  invoice_number?: string;
  vehicle_damage_image?: string;
};

export async function createInvoice(invoice: Invoice) {
  try {
    // Get business settings to get next invoice number
    const businessSettings = await getBusinessSettings();
    let invoiceNumber = 'INV-1001';
    
    if (businessSettings) {
      const prefix = businessSettings.invoice_prefix || 'INV';
      const nextNumber = businessSettings.next_invoice_number || 1001;
      
      invoiceNumber = `${prefix}-${nextNumber}`;
      
      // Update the next invoice number in business settings
      await supabase
        .from('business_settings')
        .update({
          next_invoice_number: nextNumber + 1
        })
        .eq('id', businessSettings.id);
    }
    
    // Create invoice with the invoice number
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        customer_id: invoice.customer_id,
        job_card_id: invoice.job_card_id,
        total_amount: invoice.total_amount,
        tax_amount: invoice.tax_amount,
        grand_total: invoice.grand_total,
        due_date: invoice.due_date,
        payment_date: invoice.payment_date,
        payment_method: invoice.payment_method,
        status: invoice.status,
        notes: invoice.notes,
        parts: invoice.parts,
        services: invoice.services,
        invoice_number: invoiceNumber,
        vehicle_damage_image: invoice.vehicle_damage_image
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

export async function getAllInvoices() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:customer_id(*)');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function getInvoiceById(id: string) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

export async function updateInvoice(id: string, updates: Partial<Invoice>) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    return null;
  }
}

export async function deleteInvoice(id: string) {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
}

export async function printInvoice(invoiceId: string) {
  try {
    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, job_card_id(*)')
      .eq('id', invoiceId)
      .single();
    
    if (invoiceError) throw invoiceError;
    
    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', invoice.customer_id)
      .single();
    
    if (customerError) throw customerError;

    // Get business settings
    const businessSettings = await getBusinessSettings();
    
    return {
      invoice,
      customer,
      businessSettings
    };
  } catch (error) {
    console.error('Error fetching invoice data for printing:', error);
    throw error;
  }
}
