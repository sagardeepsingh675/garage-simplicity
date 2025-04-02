
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
      .select('quantity, name')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    if (!item) throw new Error('Item not found');
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 0) {
      toast.error(`Cannot reduce quantity of ${item.name} below zero`);
      return null;
    }
    
    const { data, error: updateError } = await supabase
      .from('inventory_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    toast.success(`Inventory quantity for ${item.name} updated successfully`);
    return data;
  } catch (error: any) {
    console.error('Error updating inventory quantity:', error);
    toast.error('Failed to update inventory quantity');
    return null;
  }
}

export async function reserveInventoryItems(items: { id: string, quantity: number }[]) {
  try {
    // For each item, check if we have enough quantity and update
    const results = [];
    const failures = [];
    
    for (const item of items) {
      const { data: inventoryItem, error: getError } = await supabase
        .from('inventory_items')
        .select('quantity, name')
        .eq('id', item.id)
        .single();
      
      if (getError) {
        console.error(`Error fetching item ${item.id}:`, getError);
        failures.push({ id: item.id, reason: 'Item not found in database' });
        continue;
      }
      
      if (!inventoryItem) {
        failures.push({ id: item.id, reason: 'Item not found' });
        continue;
      }
      
      if (inventoryItem.quantity < item.quantity) {
        failures.push({ 
          id: item.id, 
          name: inventoryItem.name,
          reason: `Not enough in stock. Only ${inventoryItem.quantity} available of ${item.quantity} requested.` 
        });
        continue;
      }
      
      const newQuantity = inventoryItem.quantity - item.quantity;
      
      const { data, error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', item.id)
        .select()
        .single();
      
      if (updateError) {
        console.error(`Error updating item ${item.id}:`, updateError);
        failures.push({ id: item.id, name: inventoryItem.name, reason: 'Database update failed' });
        continue;
      }
      
      results.push(data);
    }
    
    if (failures.length > 0) {
      failures.forEach(failure => {
        toast.error(`Issue with item ${failure.name || failure.id}: ${failure.reason}`);
      });
    }
    
    if (results.length > 0) {
      toast.success(`Reserved ${results.length} inventory items successfully`);
    }
    
    return { 
      success: results.length === items.length, 
      updatedItems: results,
      failedItems: failures
    };
  } catch (error: any) {
    console.error('Error reserving inventory items:', error);
    toast.error('Failed to reserve inventory items');
    return { success: false, updatedItems: [], failedItems: [] };
  }
}
