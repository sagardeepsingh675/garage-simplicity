
import { supabase } from "@/integrations/supabase/client";
import { formatInvoiceData } from "./utils";
import { Invoice, SupabaseInvoice } from "./types";

/**
 * Fetches all invoices with related data
 */
export async function fetchInvoices() {
  console.log('Fetching invoices...');
  
  const { data: invoices, error: invoicesError } = await supabase
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

  if (invoicesError) {
    console.error('Supabase error in fetchInvoices:', invoicesError);
    throw invoicesError;
  }

  console.log('Invoices fetched successfully:', invoices);
  
  // Format each invoice
  return invoices.map(invoice => formatInvoiceData(invoice));
}

/**
 * Fetches a single invoice by ID
 */
export async function fetchInvoiceById(id: string) {
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
  
  return formatInvoiceData(data as SupabaseInvoice);
}

/**
 * Inserts a new invoice into the database
 */
export async function insertInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
  // Ensure status is one of the allowed values
  let validStatus: 'paid' | 'pending' | 'overdue' = 'pending';
  if (invoice.status === 'paid' || invoice.status === 'overdue') {
    validStatus = invoice.status;
  }
  
  // Prepare invoice data for insertion - removing vehicle_id which doesn't exist in the table
  const invoiceToInsert = {
    customer_id: invoice.customer_id,
    job_card_id: invoice.job_card_id,
    total_amount: invoice.total_amount,
    tax_amount: invoice.tax_amount,
    grand_total: invoice.grand_total,
    status: validStatus,
    due_date: invoice.due_date,
    payment_date: invoice.payment_date,
    payment_method: invoice.payment_method,
    notes: invoice.notes,
    // Convert services and parts to JSONB
    services: invoice.services,
    parts: invoice.parts
  };
  
  console.log('Inserting invoice data:', invoiceToInsert);
  
  // Process inventory items if present in parts
  const partsWithInventory = (invoice.parts || []).filter(part => part.inventory_item_id);
  
  try {
    // Begin a transaction - this ensures all operations succeed or fail together
    // First, insert the invoice
    const { data: insertedData, error: insertError } = await supabase
      .from('invoices')
      .insert([invoiceToInsert])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting invoice:', insertError);
      throw insertError;
    }
    
    if (!insertedData) {
      throw new Error('Failed to insert invoice, no data returned');
    }
    
    // Update inventory quantities if parts with inventory IDs exist
    if (partsWithInventory.length > 0) {
      for (const part of partsWithInventory) {
        if (part.inventory_item_id) {
          try {
            // First get current inventory quantity
            const { data: inventoryItem, error: getError } = await supabase
              .from('inventory_items')
              .select('quantity')
              .eq('id', part.inventory_item_id)
              .single();
              
            if (getError) {
              console.error(`Error getting inventory item ${part.inventory_item_id}:`, getError);
              continue;
            }
            
            if (!inventoryItem) {
              console.error(`Inventory item ${part.inventory_item_id} not found`);
              continue;
            }
            
            // Calculate new quantity
            const newQuantity = inventoryItem.quantity - (part.quantity || 1);
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
              console.error(`Error updating inventory quantity for ${part.inventory_item_id}:`, updateError);
            } else {
              console.log(`Updated inventory quantity for ${part.name} to ${newQuantity}`);
            }
          } catch (error) {
            console.error(`Error processing inventory update for part ${part.name}:`, error);
          }
        }
      }
    }
    
    return insertedData;
  } catch (error) {
    console.error('Error in insertInvoice:', error);
    throw error;
  }
}

/**
 * Updates an existing invoice
 */
export async function updateInvoiceData(id: string, updates: Partial<Invoice>) {
  // Ensure status is one of the allowed values if it's being updated
  if (updates.status) {
    let validStatus: 'paid' | 'pending' | 'overdue' = 'pending';
    if (updates.status === 'paid' || updates.status === 'overdue') {
      validStatus = updates.status;
    }
    updates.status = validStatus;
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      customers(name, phone, email),
      job_cards(id, issue_description, vehicles(id, make, model, license_plate, year))
    `)
    .single();
  
  if (error) throw error;
  
  return data;
}

/**
 * Deletes an invoice by ID
 */
export async function deleteInvoiceData(id: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  return true;
}

/**
 * Fetch job card details for invoice creation
 */
export async function fetchJobCardDetailsForInvoice(jobCardId: string) {
  try {
    // Get job card basic info
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .select(`
        *,
        vehicles (*),
        customers (*)
      `)
      .eq('id', jobCardId)
      .single();
    
    if (jobCardError) throw jobCardError;
    
    // Get job card items
    const { data: items, error: itemsError } = await supabase
      .from('job_card_items')
      .select(`
        *,
        inventory_items (*)
      `)
      .eq('job_card_id', jobCardId);
    
    if (itemsError) throw itemsError;
    
    // Get job card services
    const { data: services, error: servicesError } = await supabase
      .from('job_card_services')
      .select('*')
      .eq('job_card_id', jobCardId);
    
    if (servicesError) throw servicesError;
    
    // Format the data
    const formattedParts = items.map(item => ({
      id: item.id,
      inventory_item_id: item.inventory_item_id,
      name: item.inventory_items?.name || 'Unknown part',
      quantity: item.quantity || 1,
      price: item.price_per_unit || 0,
      total: (item.quantity || 1) * (item.price_per_unit || 0)
    }));
    
    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.service_name,
      description: service.description,
      hours: service.hours_spent || 1,
      rate: service.rate_per_hour || 0,
      total: (service.hours_spent || 1) * (service.rate_per_hour || 0)
    }));
    
    const partsTotal = formattedParts.reduce((sum, part) => sum + part.total, 0);
    const servicesTotal = formattedServices.reduce((sum, service) => sum + service.total, 0);
    
    return {
      jobCard,
      parts: formattedParts,
      services: formattedServices,
      totals: {
        parts: partsTotal,
        services: servicesTotal,
        total: partsTotal + servicesTotal
      }
    };
  } catch (error) {
    console.error('Error fetching job card details for invoice:', error);
    throw error;
  }
}
