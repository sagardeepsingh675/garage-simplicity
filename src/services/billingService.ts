import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

type DatabaseInvoice = {
  id: string;
  customer_id: string;
  vehicle_id: string;
  job_card_id: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
  updated_at: string;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
}

export async function getInvoices() {
  try {
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
            make,
            model,
            license_plate,
            year
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('Supabase error in getInvoices:', invoicesError);
      throw invoicesError;
    }

    console.log('Invoices fetched successfully:', invoices);
    return invoices;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    toast.error('Failed to fetch invoices');
    return [];
  }
}

export async function getInvoiceById(id: string) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(name, phone, email),
        vehicles(make, model, license_plate, year),
        job_cards(id, issue_description)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    toast.error('Failed to load invoice details');
    return null;
  }
}

export async function createInvoice(invoice: Omit<DatabaseInvoice, 'id' | 'created_at' | 'updated_at'>) {
  try {
    console.log('Creating invoice with data:', invoice);
    
    // First, insert the invoice
    const { data: insertedData, error: insertError } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting invoice:', insertError);
      throw insertError;
    }
    
    console.log('Invoice inserted successfully:', insertedData);
    
    // Then fetch the complete invoice with relations
    const { data: completeData, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(name, phone, email),
        vehicles(make, model, license_plate, year),
        job_cards(id, issue_description)
      `)
      .eq('id', insertedData.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching complete invoice:', fetchError);
      throw fetchError;
    }
    
    console.log('Complete invoice data:', completeData);
    toast.success('Invoice created successfully');
    return completeData;
  } catch (error: any) {
    console.error('Error in createInvoice:', error);
    toast.error('Failed to create invoice');
    return null;
  }
}

export async function updateInvoiceStatus(id: string, status: DatabaseInvoice['status']) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        customers(name, phone, email),
        vehicles(make, model, license_plate, year),
        job_cards(id, issue_description)
      `)
      .single();
    
    if (error) throw error;
    
    toast.success('Invoice status updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    toast.error('Failed to update invoice status');
    return null;
  }
}

export async function updateInvoice(id: string, updates: Partial<DatabaseInvoice>) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        customers(name, phone, email),
        vehicles(make, model, license_plate, year),
        job_cards(id, issue_description)
      `)
      .single();
    
    if (error) throw error;
    
    toast.success('Invoice updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    toast.error('Failed to update invoice');
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
    
    toast.success('Invoice deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    toast.error('Failed to delete invoice');
    return false;
  }
} 