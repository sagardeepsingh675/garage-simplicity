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
  
  const invoiceToInsert = {
    ...invoice,
    status: validStatus
  };
  
  console.log('Inserting invoice data:', invoiceToInsert);
  
  // Process inventory items if present in parts
  const partsWithInventory = invoice.parts.filter(part => part.inventory_item_id);
  
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
