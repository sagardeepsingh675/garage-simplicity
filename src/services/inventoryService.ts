
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type InventoryItem = {
  id: string;
  name: string;
  category?: string;
  part_number?: string;
  brand?: string;
  price: number;
  quantity: number;
  min_quantity: number;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getInventoryItems() {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching inventory items:', error);
    toast.error('Failed to load inventory');
    return [];
  }
}

export async function getInventoryItemById(id: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching inventory item:', error);
    toast.error('Failed to load item details');
    return null;
  }
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Inventory item created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    toast.error('Failed to create inventory item');
    return null;
  }
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Inventory item updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    toast.error('Failed to update inventory item');
    return null;
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Inventory item deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    toast.error('Failed to delete inventory item');
    return false;
  }
}

export async function updateInventoryQuantity(id: string, change: number) {
  try {
    // First get the current quantity
    const { data: item, error: getError } = await supabase
      .from('inventory_items')
      .select('quantity')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    if (!item) throw new Error('Item not found');
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 0) {
      toast.error('Cannot reduce quantity below zero');
      return null;
    }
    
    const { data, error: updateError } = await supabase
      .from('inventory_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    toast.success('Inventory quantity updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating inventory quantity:', error);
    toast.error('Failed to update inventory quantity');
    return null;
  }
}
