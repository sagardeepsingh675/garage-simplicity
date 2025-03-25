import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type Vehicle = {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getVehicles() {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        customers(id, name, phone, email)
      `)
      .order('make');
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    toast.error('Failed to load vehicles');
    return [];
  }
}

export async function getVehiclesByCustomerId(customerId: string) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId);
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching customer vehicles:', error);
    toast.error('Failed to load customer vehicles');
    return [];
  }
}

export async function getVehicleById(id: string) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        customers(id, name, phone, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching vehicle:', error);
    toast.error('Failed to load vehicle details');
    return null;
  }
}

export async function createVehicle(vehicle: Omit<Vehicle, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Vehicle created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    toast.error('Failed to create vehicle');
    return null;
  }
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .update(vehicle)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Vehicle updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    toast.error('Failed to update vehicle');
    return null;
  }
}

export async function deleteVehicle(id: string) {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Vehicle deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    toast.error('Failed to delete vehicle');
    return false;
  }
}
