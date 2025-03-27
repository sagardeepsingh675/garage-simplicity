
import { toast } from "@/lib/toast";
import { fetchInvoices, fetchInvoiceById, insertInvoice, updateInvoiceData, deleteInvoiceData } from "./queries";
import { formatInvoiceData } from "./utils";
import { Invoice } from "./types";

/**
 * Gets all invoices
 */
export async function getInvoices() {
  try {
    return await fetchInvoices();
  } catch (error) {
    console.error('Error fetching invoices:', error);
    toast.error('Failed to fetch invoices');
    return [];
  }
}

/**
 * Gets a single invoice by ID
 */
export async function getInvoiceById(id: string) {
  try {
    return await fetchInvoiceById(id);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    toast.error('Failed to load invoice details');
    return null;
  }
}

/**
 * Creates a new invoice
 */
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
  try {
    console.log('Creating invoice with data:', invoice);
    
    // Validate that status is one of the allowed values
    if (invoice.status !== 'paid' && invoice.status !== 'pending' && invoice.status !== 'overdue') {
      console.error('Invalid invoice status:', invoice.status);
      throw new Error('Invalid invoice status. Must be "paid", "pending", or "overdue"');
    }
    
    // First insert the invoice
    const insertedData = await insertInvoice(invoice);
    console.log('Invoice inserted successfully:', insertedData);
    
    // Then fetch the complete invoice with relations
    const completeData = await fetchInvoiceById(insertedData.id);
    
    console.log('Complete invoice data:', completeData);
    toast.success('Invoice created successfully');
    return completeData;
  } catch (error: any) {
    console.error('Error in createInvoice:', error);
    toast.error(`Failed to create invoice: ${error.message || 'Unknown error'}`);
    return null;
  }
}

/**
 * Updates the status of an invoice
 */
export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
  try {
    const data = await updateInvoiceData(id, { status });
    const formattedInvoice = formatInvoiceData(data);
    
    toast.success('Invoice status updated successfully');
    return formattedInvoice;
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    toast.error('Failed to update invoice status');
    return null;
  }
}

/**
 * Updates an invoice
 */
export async function updateInvoice(id: string, updates: Partial<Invoice>) {
  try {
    const data = await updateInvoiceData(id, updates);
    const formattedInvoice = formatInvoiceData(data);
    
    toast.success('Invoice updated successfully');
    return formattedInvoice;
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    toast.error('Failed to update invoice');
    return null;
  }
}

/**
 * Deletes an invoice
 */
export async function deleteInvoice(id: string) {
  try {
    await deleteInvoiceData(id);
    
    toast.success('Invoice deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    toast.error('Failed to delete invoice');
    return false;
  }
}

// Re-export types
export * from './types';
