
import { Invoice, SupabaseInvoice } from "./types";

/**
 * Formats a Supabase invoice object to match the Invoice type
 */
export function formatInvoiceData(invoice: SupabaseInvoice): Invoice {
  // Ensure status is one of the allowed values
  let validStatus: 'paid' | 'pending' | 'overdue' = 'pending';
  if (invoice.status === 'paid' || invoice.status === 'overdue') {
    validStatus = invoice.status as 'paid' | 'overdue';
  }
  
  // Transform the data to match the expected format
  return {
    id: invoice.id || '',
    customer_id: invoice.customer_id || '',
    vehicle_id: invoice.job_cards?.vehicles?.id || '',
    job_card_id: invoice.job_card_id || '',
    total_amount: invoice.total_amount || 0,
    tax_amount: invoice.tax_amount || 0,
    grand_total: invoice.grand_total || 0,
    status: validStatus,
    created_at: invoice.created_at || new Date().toISOString(),
    updated_at: invoice.updated_at || new Date().toISOString(),
    due_date: invoice.due_date || new Date().toISOString(),
    payment_date: invoice.payment_date,
    payment_method: invoice.payment_method,
    notes: invoice.notes,
    // Parse services and parts from JSONB if they exist
    services: invoice.services || [],
    parts: invoice.parts || [],
    customers: invoice.customers,
    job_cards: invoice.job_cards
  };
}

/**
 * Validates invoice data before submission
 */
export function validateInvoiceData(invoice: Partial<Invoice>): boolean {
  // Basic validation
  if (!invoice.customer_id || !invoice.job_card_id) {
    return false;
  }
  
  // Validate status
  if (invoice.status && 
      invoice.status !== 'paid' && 
      invoice.status !== 'pending' && 
      invoice.status !== 'overdue') {
    return false;
  }
  
  return true;
}
