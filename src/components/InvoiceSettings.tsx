
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FilePenLine, Receipt, Percent } from 'lucide-react';
import { BusinessSettings } from '@/services/businessSettingsService';

interface InvoiceSettingsProps {
  businessSettings: BusinessSettings;
  setBusinessSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
}

export function InvoiceSettings({ businessSettings, setBusinessSettings }: InvoiceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Settings</CardTitle>
        <CardDescription>
          Configure how invoices are generated and what information is displayed on them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix" className="flex items-center gap-2">
                <FilePenLine className="h-4 w-4" />
                Invoice Prefix
              </Label>
              <Input 
                id="invoice_prefix" 
                value={businessSettings.invoice_prefix || 'INV'}
                onChange={(e) => setBusinessSettings({
                  ...businessSettings, 
                  invoice_prefix: e.target.value
                })}
                placeholder="INV"
              />
              <p className="text-sm text-muted-foreground">
                Prefix added to invoice numbers (e.g., INV-1001)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="next_invoice_number" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Next Invoice Number
              </Label>
              <Input 
                id="next_invoice_number" 
                type="number"
                value={businessSettings.next_invoice_number || 1001}
                onChange={(e) => setBusinessSettings({
                  ...businessSettings, 
                  next_invoice_number: parseInt(e.target.value, 10) || 1001
                })}
                placeholder="1001"
              />
              <p className="text-sm text-muted-foreground">
                The next invoice number to be used (will auto-increment for each new invoice)
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gst_number" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                GST Number
              </Label>
              <Input 
                id="gst_number" 
                value={businessSettings.gst_number || ''}
                onChange={(e) => setBusinessSettings({
                  ...businessSettings, 
                  gst_number: e.target.value
                })}
                placeholder="Enter your GST number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gst_percentage" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                GST Percentage
              </Label>
              <Input 
                id="gst_percentage" 
                type="number"
                value={businessSettings.gst_percentage || 0}
                onChange={(e) => setBusinessSettings({
                  ...businessSettings, 
                  gst_percentage: parseFloat(e.target.value) || 0
                })}
                placeholder="18"
              />
              <p className="text-sm text-muted-foreground">
                The GST percentage to apply to invoices
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="show_gst_on_invoice"
                checked={businessSettings.show_gst_on_invoice || false}
                onCheckedChange={(checked) => setBusinessSettings({
                  ...businessSettings,
                  show_gst_on_invoice: checked
                })}
              />
              <Label htmlFor="show_gst_on_invoice">Show GST on invoices</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
