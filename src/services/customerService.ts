
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    toast.error('Failed to load customers');
    return [];
  }
}

export async function getCustomerById(id: string) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    toast.error('Failed to load customer details');
    return null;
  }
}

export async function createCustomer(customer: Omit<Customer, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Customer created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating customer:', error);
    toast.error('Failed to create customer');
    return null;
  }
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Customer updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating customer:', error);
    toast.error('Failed to update customer');
    return null;
  }
}

export async function deleteCustomer(id: string) {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Customer deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    toast.error('Failed to delete customer');
    return false;
  }
}
