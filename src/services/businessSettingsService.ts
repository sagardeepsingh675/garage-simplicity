
import { supabase } from "@/integrations/supabase/client";

export type BusinessSettings = {
  id?: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  logo_url: string;
  created_at?: string;
  updated_at?: string;
  // Add invoice settings properties
  invoice_prefix: string;
  next_invoice_number: number;
  // Add GST settings
  gst_number: string;
  gst_percentage: number;
  show_gst_on_invoice: boolean;
};

export async function getBusinessSettings() {
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching business settings:', error);
    return null;
  }
}

export async function updateBusinessSettings(settings: BusinessSettings) {
  try {
    if (settings.id) {
      // Update existing settings
      const { data, error } = await supabase
        .from('business_settings')
        .update({
          business_name: settings.business_name,
          business_address: settings.business_address,
          business_phone: settings.business_phone,
          logo_url: settings.logo_url,
          invoice_prefix: settings.invoice_prefix,
          next_invoice_number: settings.next_invoice_number,
          gst_number: settings.gst_number,
          gst_percentage: settings.gst_percentage,
          show_gst_on_invoice: settings.show_gst_on_invoice
        })
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('business_settings')
        .insert([settings])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error updating business settings:', error);
    return null;
  }
}

export async function uploadLogo(file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('business')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('business')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading logo:', error);
    return null;
  }
}
