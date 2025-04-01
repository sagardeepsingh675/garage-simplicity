
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
    // Ensure we have all required fields
    if (!jobCard.vehicle_id || !jobCard.customer_id || !jobCard.issue_description) {
      toast.error('Missing required fields for job card');
      return null;
    }

    const { data, error } = await supabase
      .from('job_cards')
      .insert({
        vehicle_id: jobCard.vehicle_id,
        customer_id: jobCard.customer_id,
        issue_description: jobCard.issue_description,
        assigned_staff: jobCard.assigned_staff,
        status: jobCard.status || 'pending',
        start_date: jobCard.start_date,
        completion_date: jobCard.completion_date,
        diagnosis: jobCard.diagnosis
      })
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
    const updateData = { ...jobCard, updated_at: new Date().toISOString() };
    
    // If status is in-progress and no start date is set, set it to now
    if (jobCard.status === 'in-progress' && !jobCard.start_date) {
      updateData.start_date = new Date().toISOString();
    }
    
    // If status is completed and no completion date is set, set it to now
    if (jobCard.status === 'completed' && !jobCard.completion_date) {
      updateData.completion_date = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('job_cards')
      .update(updateData)
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
export type JobCardItem = {
  id?: string;
  job_card_id: string;
  inventory_item_id: string;
  quantity: number;
  price_per_unit: number;
};

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

export async function addJobCardItem(item: JobCardItem) {
  try {
    // First check if we have enough inventory
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('quantity')
      .eq('id', item.inventory_item_id)
      .single();
    
    if (inventoryError) throw inventoryError;
    
    if (!inventoryItem) {
      toast.error('Inventory item not found');
      return null;
    }
    
    if (inventoryItem.quantity < item.quantity) {
      toast.error(`Not enough quantity available. Only ${inventoryItem.quantity} in stock.`);
      return null;
    }
    
    // Add the job card item
    const { data, error } = await supabase
      .from('job_card_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    
    // Reduce inventory quantity
    const newQuantity = inventoryItem.quantity - item.quantity;
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.inventory_item_id);
    
    if (updateError) {
      console.error('Error updating inventory quantity:', updateError);
      // Don't fail the transaction, but log the error
    }
    
    toast.success('Part added to job card');
    return data;
  } catch (error: any) {
    console.error('Error adding job card item:', error);
    toast.error('Failed to add part to job card');
    return null;
  }
}

export async function removeJobCardItem(itemId: string) {
  try {
    // First get the item details
    const { data: item, error: getError } = await supabase
      .from('job_card_items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (getError) throw getError;
    
    if (!item) {
      toast.error('Item not found');
      return false;
    }
    
    // Delete the item
    const { error } = await supabase
      .from('job_card_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    
    // Return the inventory quantity
    if (item.inventory_item_id) {
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', item.inventory_item_id)
        .single();
      
      if (!inventoryError && inventoryItem) {
        const newQuantity = inventoryItem.quantity + item.quantity;
        await supabase
          .from('inventory_items')
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.inventory_item_id);
      }
    }
    
    toast.success('Part removed from job card');
    return true;
  } catch (error: any) {
    console.error('Error removing job card item:', error);
    toast.error('Failed to remove part from job card');
    return false;
  }
}

// Job Card Services
export type JobCardService = {
  id?: string;
  job_card_id: string;
  service_name: string;
  description?: string;
  hours_spent?: number;
  rate_per_hour: number;
};

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

export async function addJobCardService(service: JobCardService) {
  try {
    const { data, error } = await supabase
      .from('job_card_services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Service added to job card');
    return data;
  } catch (error: any) {
    console.error('Error adding job card service:', error);
    toast.error('Failed to add service to job card');
    return null;
  }
}

export async function removeJobCardService(serviceId: string) {
  try {
    const { error } = await supabase
      .from('job_card_services')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
    
    toast.success('Service removed from job card');
    return true;
  } catch (error: any) {
    console.error('Error removing job card service:', error);
    toast.error('Failed to remove service from job card');
    return false;
  }
}

export async function updateJobCardStatus(jobCardId: string, status: string) {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    // If status is in-progress and no start date is set, set it to now
    if (status === 'in-progress') {
      // First check if start_date is already set
      const { data: existingData } = await supabase
        .from('job_cards')
        .select('start_date')
        .eq('id', jobCardId)
        .single();
        
      if (!existingData?.start_date) {
        updateData.start_date = new Date().toISOString();
      }
    }
    
    // If status is completed, set completion date to now
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
