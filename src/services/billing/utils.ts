
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
    ...invoice,
    vehicle_id: invoice.job_cards?.vehicles?.id || '',
    services: invoice.services || [],
    parts: invoice.parts || [],
    status: validStatus
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
