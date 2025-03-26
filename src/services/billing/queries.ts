
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
  
  // First, insert the invoice
  const { data: insertedData, error: insertError } = await supabase
    .from('invoices')
    .insert([invoiceToInsert])
    .select()
    .single();
  
  if (insertError) throw insertError;
  
  return insertedData;
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
