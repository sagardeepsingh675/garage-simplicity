import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type JobCard = {
  id: string;
  vehicle_id: string;
  customer_id: string;
  issue_description: string;
  assigned_staff: string | null;
  status: string;
  start_date: string | null;
  completion_date: string | null;
  diagnosis: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getJobCards() {
  try {
    const { data, error } = await supabase
      .from('job_cards')
      .select(`
        *,
        vehicles(id, make, model, license_plate),
        customers(id, name, phone),
        staff(id, name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching job cards:', error);
    toast.error('Failed to load job cards');
    return [];
  }
}

export async function getJobCardsByVehicleId(vehicleId: string) {
  try {
    const { data, error } = await supabase
      .from('job_cards')
      .select(`
        *,
        vehicles(id, make, model, license_plate),
        customers(id, name, phone),
        staff(id, name)
      `)
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching vehicle job cards:', error);
    toast.error('Failed to load job cards');
    return [];
  }
}

export async function getJobCardById(id: string) {
  try {
    const { data, error } = await supabase
      .from('job_cards')
      .select(`
        *,
        customers (
          name,
          phone,
          email
        ),
        vehicles (
          make,
          model,
          license_plate,
          year,
          color
        ),
        staff (
          name,
          role
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching job card:', error);
    toast.error('Failed to load job card details');
    return null;
  }
}

export async function createJobCard(jobCard: Omit<JobCard, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('job_cards')
      .insert(jobCard)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Job card created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating job card:', error);
    toast.error('Failed to create job card');
    return null;
  }
}

export async function updateJobCard(id: string, jobCard: Partial<JobCard>) {
  try {
    const { data, error } = await supabase
      .from('job_cards')
      .update(jobCard)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Job card updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating job card:', error);
    toast.error('Failed to update job card');
    return null;
  }
}

export async function deleteJobCard(id: string) {
  try {
    const { error } = await supabase
      .from('job_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Job card deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting job card:', error);
    toast.error('Failed to delete job card');
    return false;
  }
}

// Job Card Items (Parts)
export async function getJobCardItems(jobCardId: string) {
  try {
    const { data, error } = await supabase
      .from('job_card_items')
      .select(`
        *,
        inventory_items(id, name, part_number)
      `)
      .eq('job_card_id', jobCardId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching job card items:', error);
    toast.error('Failed to load job card items');
    return [];
  }
}

// Job Card Services
export async function getJobCardServices(jobCardId: string) {
  try {
    const { data, error } = await supabase
      .from('job_card_services')
      .select('*')
      .eq('job_card_id', jobCardId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching job card services:', error);
    toast.error('Failed to load job card services');
    return [];
  }
}

export async function updateJobCardStatus(jobCardId: string, status: string) {
  try {
    const updateData: any = { status };
    
    // If status is completed, set completion date
    if (status === 'completed') {
      updateData.completion_date = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('job_cards')
      .update(updateData)
      .eq('id', jobCardId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Job card status updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating job card status:', error);
    toast.error('Failed to update job card status');
    return null;
  }
}
