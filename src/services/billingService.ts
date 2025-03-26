
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type Invoice = {
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
  services: { name: string; cost: number }[];
  parts: { name: string; quantity: number; cost: number }[];
  customers?: {
    name: string;
    phone: string;
    email: string;
  };
  job_cards?: {
    id: string;
    issue_description: string;
    vehicles?: {
      make: string;
      model: string;
      license_plate: string;
      year: number;
    }
  };
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
    
    // Transform the data to match the expected format
    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      vehicle_id: invoice.job_cards?.vehicles?.id || '',
      services: invoice.services || [],
      parts: invoice.parts || []
    }));

    return formattedInvoices;
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
        job_cards(id, issue_description, vehicles(make, model, license_plate, year))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match the expected format
    const formattedInvoice = {
      ...data,
      vehicle_id: data.job_cards?.vehicles?.id || '',
      services: data.services || [],
      parts: data.parts || []
    };
    
    return formattedInvoice;
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    toast.error('Failed to load invoice details');
    return null;
  }
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
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
        job_cards(id, issue_description, vehicles(make, model, license_plate, year))
      `)
      .eq('id', insertedData.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching complete invoice:', fetchError);
      throw fetchError;
    }
    
    // Transform the data to match the expected format
    const formattedInvoice = {
      ...completeData,
      vehicle_id: completeData.job_cards?.vehicles?.id || '',
      services: completeData.services || [],
      parts: completeData.parts || []
    };
    
    console.log('Complete invoice data:', formattedInvoice);
    toast.success('Invoice created successfully');
    return formattedInvoice;
  } catch (error: any) {
    console.error('Error in createInvoice:', error);
    toast.error('Failed to create invoice');
    return null;
  }
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        customers(name, phone, email),
        job_cards(id, issue_description, vehicles(make, model, license_plate, year))
      `)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match the expected format
    const formattedInvoice = {
      ...data,
      vehicle_id: data.job_cards?.vehicles?.id || '',
      services: data.services || [],
      parts: data.parts || []
    };
    
    toast.success('Invoice status updated successfully');
    return formattedInvoice;
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    toast.error('Failed to update invoice status');
    return null;
  }
}

export async function updateInvoice(id: string, updates: Partial<Invoice>) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        customers(name, phone, email),
        job_cards(id, issue_description, vehicles(make, model, license_plate, year))
      `)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match the expected format
    const formattedInvoice = {
      ...data,
      vehicle_id: data.job_cards?.vehicles?.id || '',
      services: data.services || [],
      parts: data.parts || []
    };
    
    toast.success('Invoice updated successfully');
    return formattedInvoice;
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
