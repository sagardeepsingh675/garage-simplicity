
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type BusinessSettings = {
  id?: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  logo_url?: string;
  invoice_prefix?: string;
  next_invoice_number?: number;
  gst_number?: string;
  gst_percentage?: number;
  show_gst_on_invoice?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getBusinessSettings() {
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching business settings:', error);
    return null;
  }
}

export async function updateBusinessSettings(settings: Partial<BusinessSettings>) {
  try {
    // Check if settings already exist
    const { data: existing } = await supabase
      .from('business_settings')
      .select('id')
      .maybeSingle();

    let result;
    if (existing?.id) {
      // Update existing settings
      const { data, error } = await supabase
        .from('business_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings - ensure required fields are present
      if (!settings.business_name || !settings.business_address || !settings.business_phone) {
        throw new Error("Business name, address, and phone are required");
      }

      const { data, error } = await supabase
        .from('business_settings')
        .insert({
          business_name: settings.business_name,
          business_address: settings.business_address,
          business_phone: settings.business_phone,
          logo_url: settings.logo_url,
          invoice_prefix: settings.invoice_prefix || 'INV',
          next_invoice_number: settings.next_invoice_number || 1001,
          gst_number: settings.gst_number,
          gst_percentage: settings.gst_percentage || 0,
          show_gst_on_invoice: settings.show_gst_on_invoice || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    toast.success('Business settings updated successfully');
    return result;
  } catch (error: any) {
    console.error('Error updating business settings:', error);
    toast.error('Failed to update business settings');
    return null;
  }
}

export async function uploadLogo(file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `business/logo/${fileName}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('business_assets')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('business_assets')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    toast.error('Failed to upload logo');
    return null;
  }
}

// Function to handle vehicle damage image upload
export async function uploadVehicleDamageImage(file: File, vehicleId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `vehicle-damage-${vehicleId}-${Date.now()}.${fileExt}`;
    const filePath = `vehicles/damage/${fileName}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('business_assets')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('business_assets')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading vehicle damage image:', error);
    toast.error('Failed to upload vehicle damage image');
    return null;
  }
}
