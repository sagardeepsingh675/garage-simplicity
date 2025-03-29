
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type StaffPermission = 'customers' | 'vehicles' | 'job_cards' | 'inventory' | 'billing' | 'staff' | 'settings';

export type StaffUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: StaffPermission[];
  created_at?: string;
  updated_at?: string;
}

export async function createStaffUser(email: string, password: string, name: string, role: string, permissions: StaffPermission[]) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Create staff user profile with permissions
    const { data: staffData, error: staffError } = await supabase
      .from('staff_users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (staffError) throw staffError;
    
    toast.success('Staff user created successfully');
    return staffData;
  } catch (error: any) {
    console.error('Error creating staff user:', error);
    toast.error(error?.message || 'Failed to create staff user');
    return null;
  }
}

export async function getStaffUsers(): Promise<StaffUser[]> {
  try {
    const { data, error } = await supabase
      .from('staff_users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Ensure permissions are of StaffPermission type
    const typedData = data?.map(user => ({
      ...user,
      permissions: user.permissions as StaffPermission[]
    })) || [];
    
    return typedData;
  } catch (error: any) {
    console.error('Error fetching staff users:', error);
    toast.error('Failed to load staff users');
    return [];
  }
}

export async function updateStaffUser(id: string, updates: Partial<StaffUser>) {
  try {
    const { data, error } = await supabase
      .from('staff_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Staff user updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating staff user:', error);
    toast.error('Failed to update staff user');
    return null;
  }
}

export async function deleteStaffUser(id: string) {
  try {
    // Delete from staff_users table
    const { error: staffError } = await supabase
      .from('staff_users')
      .delete()
      .eq('id', id);
    
    if (staffError) throw staffError;
    
    // Delete from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) throw authError;
    
    toast.success('Staff user deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting staff user:', error);
    toast.error('Failed to delete staff user');
    return false;
  }
}

export async function resetStaffPassword(id: string, newPassword: string) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      id,
      { password: newPassword }
    );
    
    if (error) throw error;
    
    toast.success('Password reset successfully');
    return true;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast.error('Failed to reset password');
    return false;
  }
}
