
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import { getBusinessSettings } from "@/services/businessSettingsService";
import { InvoiceItem, InvoiceService, Invoice, PrintInvoiceData, InvoiceWithRelations } from "./types";

/**
 * Gets all invoices with their customer and job card relations
 */
export async function getInvoices(): Promise<InvoiceWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers (
          name,
          phone,
          email
        ),
        job_cards (
          id,
          issue_description,
          vehicles (
            id,
            make,
            model,
            license_plate,
            year
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    toast.error('Failed to fetch invoices');
    return [];
  }
}

/**
 * Gets a single invoice by ID
 */
export async function getInvoiceById(id: string): Promise<InvoiceWithRelations | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(name, phone, email),
        job_cards(id, issue_description, vehicles(id, make, model, license_plate, year))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    toast.error('Failed to load invoice details');
    return null;
  }
}

/**
 * Creates a new invoice
 */
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice | null> {
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
          next_invoice_number: nextNumber + 1,
          // We don't need to include all fields
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
    
    // Update inventory quantities for each part
    if (invoice.parts && invoice.parts.length > 0) {
      await updateInventoryQuantities(invoice.parts);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    toast.error('Failed to create invoice');
    throw error;
  }
}

/**
 * Updates inventory quantities based on invoice parts
 */
async function updateInventoryQuantities(parts: InvoiceItem[]): Promise<void> {
  for (const part of parts) {
    if (!part.inventory_item_id) continue;
    
    try {
      // Get current inventory quantity
      const { data: inventoryItem, error: getError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', part.inventory_item_id)
        .single();
        
      if (getError || !inventoryItem) {
        console.error(`Inventory item ${part.inventory_item_id} not found:`, getError);
        continue;
      }
      
      // Calculate new quantity
      const newQuantity = inventoryItem.quantity - part.quantity;
      if (newQuantity < 0) {
        console.error(`Not enough quantity available for ${part.name}`);
        continue;
      }
      
      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', part.inventory_item_id);
        
      if (updateError) {
        console.error(`Error updating inventory for ${part.inventory_item_id}:`, updateError);
      } else {
        console.log(`Updated inventory quantity for ${part.name} to ${newQuantity}`);
      }
    } catch (error) {
      console.error(`Error processing inventory update for part ${part.name}:`, error);
    }
  }
}

/**
 * Updates an invoice
 */
export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Invoice updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    toast.error('Failed to update invoice');
    return null;
  }
}

/**
 * Updates the status of an invoice
 */
export async function updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice | null> {
  try {
    return await updateInvoice(id, { status });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return null;
  }
}

/**
 * Deletes an invoice
 */
export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Invoice deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    toast.error('Failed to delete invoice');
    return false;
  }
}

/**
 * Gets job card details for invoice creation
 */
export async function getJobCardDetails(jobCardId: string) {
  try {
    // Get job card info
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .select('*, customers(*), vehicles(*)')
      .eq('id', jobCardId)
      .single();
    
    if (jobCardError) throw jobCardError;
    
    // Get job card items (parts)
    const { data: jobCardItems, error: itemsError } = await supabase
      .from('job_card_items')
      .select(`
        *,
        inventory_items(id, name, part_number, price)
      `)
      .eq('job_card_id', jobCardId);
    
    if (itemsError) throw itemsError;
    
    // Get job card services
    const { data: jobCardServices, error: servicesError } = await supabase
      .from('job_card_services')
      .select('*')
      .eq('job_card_id', jobCardId);
    
    if (servicesError) throw servicesError;
    
    // Format parts for invoice
    const parts = jobCardItems.map(item => ({
      id: item.id,
      name: item.inventory_items?.name || 'Unknown Part',
      quantity: item.quantity,
      price: item.price_per_unit,
      total: item.quantity * item.price_per_unit,
      inventory_item_id: item.inventory_item_id
    }));
    
    // Format services for invoice
    const services = jobCardServices.map(service => ({
      id: service.id,
      name: service.service_name,
      hours: service.hours_spent || 0,
      rate: service.rate_per_hour,
      total: (service.hours_spent || 0) * service.rate_per_hour
    }));
    
    return {
      jobCard,
      parts,
      services,
      totalPartsAmount: parts.reduce((sum, part) => sum + part.total, 0),
      totalServicesAmount: services.reduce((sum, service) => sum + service.total, 0)
    };
  } catch (error) {
    console.error('Error fetching job card details:', error);
    throw error;
  }
}

/**
 * Gets data needed for printing an invoice
 */
export async function printInvoice(invoiceId: string): Promise<PrintInvoiceData> {
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
      invoice: {
        ...invoice,
        // Ensure parts and services are arrays
        parts: Array.isArray(invoice.parts) ? invoice.parts : [],
        services: Array.isArray(invoice.services) ? invoice.services : []
      },
      customer,
      businessSettings
    };
  } catch (error) {
    console.error('Error fetching invoice data for printing:', error);
    throw error;
  }
}

export * from './types';
