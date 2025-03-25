import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialty: string;
  active: boolean;
  workload?: number;
  created_at?: string;
  updated_at?: string;
}

export async function getStaff() {
  try {
    console.log('Fetching staff data...');
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    console.log('Fetched staff data:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    toast.error('Failed to load staff');
    return [];
  }
}

export async function getStaffById(id: string) {
  try {
    if (!id) return null;
    
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching staff member:', error);
    toast.error('Failed to load staff details');
    return null;
  }
}

export async function createStaff(staff: Omit<Staff, 'id'>) {
  try {
    console.log('Creating staff with data:', staff);
    
    // Ensure required fields are present
    if (!staff.name || !staff.role) {
      throw new Error('Name and role are required fields');
    }

    // Clean up the data before sending
    const staffData = {
      name: staff.name.trim(),
      role: staff.role.trim(),
      email: staff.email?.trim() || null,
      phone: staff.phone?.trim() || null,
      specialty: staff.specialty?.trim() || null,
      active: staff.active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Cleaned staff data:', staffData);
    
    const { data, error } = await supabase
      .from('staff')
      .insert(staffData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }
    
    console.log('Staff created successfully:', data);
    toast.success('Staff member created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    toast.error(error.message || 'Failed to create staff member');
    return null;
  }
}

export async function updateStaff(id: string, staff: Partial<Staff>) {
  try {
    const { data, error } = await supabase
      .from('staff')
      .update(staff)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Staff member updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating staff member:', error);
    toast.error('Failed to update staff member');
    return null;
  }
}

export async function deleteStaff(id: string) {
  try {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Staff member deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting staff member:', error);
    toast.error('Failed to delete staff member');
    return false;
  }
} 