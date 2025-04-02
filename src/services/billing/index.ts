
import { toast } from "@/lib/toast";
import { fetchInvoices, fetchInvoiceById, insertInvoice, updateInvoiceData, deleteInvoiceData } from "./queries";
import { formatInvoiceData } from "./utils";
import { Invoice, InvoiceItem, InvoiceService } from "./types";
import { reserveInventoryItems } from "../inventoryService";

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
    
    // Reserve inventory items if we have parts included in this invoice
    if (invoice.parts && invoice.parts.length > 0) {
      // Format the parts data for the inventory reservation
      const itemsToReserve = invoice.parts.map(part => ({
        id: part.id,
        quantity: part.quantity
      }));
      
      // Reserve the inventory items
      const { success, failedItems } = await reserveInventoryItems(itemsToReserve);
      
      if (!success) {
        console.warn('Some inventory items could not be reserved:', failedItems);
        if (failedItems.length === itemsToReserve.length) {
          throw new Error('Could not reserve any inventory items');
        }
      }
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

// Get invoice data from a job card
export async function getInvoiceDataFromJobCard(jobCardId: string) {
  try {
    // This function would fetch job card details, including items and services
    // and format them for billing purposes
    const response = await fetch(`/api/job-cards/${jobCardId}/billing-data`);
    if (!response.ok) throw new Error('Failed to fetch job card billing data');
    
    return await response.json();
  } catch (error) {
    console.error('Error getting invoice data from job card:', error);
    toast.error('Failed to get billing data from job card');
    return null;
  }
}

// Re-export types
export * from './types';
