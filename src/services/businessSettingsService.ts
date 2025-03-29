
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export type BusinessSettings = {
  id?: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  logo_url?: string;
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
