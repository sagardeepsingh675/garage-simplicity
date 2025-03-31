import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { Building, User, Upload, Users, Trash2, Plus, Settings as SettingsIcon } from 'lucide-react';
import { getBusinessSettings, updateBusinessSettings, uploadLogo, BusinessSettings } from '@/services/businessSettingsService';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '@/services/staffService';
import { InvoiceSettings } from '@/components/InvoiceSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    business_name: '',
    business_address: '',
    business_phone: '',
    logo_url: '',
    invoice_prefix: 'INV',
    next_invoice_number: 1001,
    gst_number: '',
    gst_percentage: 18,
    show_gst_on_invoice: true
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Staff management state
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    is_active: true
  });

  // Fetch business settings
  const { data: fetchedSettings, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: getBusinessSettings,
    onSuccess: (data) => {
      if (data) {
        setBusinessSettings({
          id: data.id,
          business_name: data.business_name || '',
          business_address: data.business_address || '',
          business_phone: data.business_phone || '',
          logo_url: data.logo_url || '',
          invoice_prefix: data.invoice_prefix || 'INV',
          next_invoice_number: data.next_invoice_number || 1001,
          gst_number: data.gst_number || '',
          gst_percentage: data.gst_percentage || 18,
          show_gst_on_invoice: data.show_gst_on_invoice || false
        });
      }
    }
  });

  // Fetch staff
  const { data: staff = [], isLoading: isLoadingStaff, refetch: refetchStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: getAllStaff
  });

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle business settings form submission
  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload logo if a new one was selected
      let logoUrl = businessSettings.logo_url;
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }
      
      // Update business settings
      const updatedSettings = await updateBusinessSettings({
        ...businessSettings,
        logo_url: logoUrl
      });
      
      if (updatedSettings) {
        toast.success('Business settings updated successfully');
        refetchSettings();
      } else {
        toast.error('Failed to update business settings');
      }
    } catch (error) {
      console.error('Error updating business settings:', error);
      toast.error('An error occurred while updating settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle staff form changes
  const handleStaffFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStaffForm({
      ...staffForm,
      [name]: value
    });
  };

  // Handle staff active status toggle
  const handleStaffActiveToggle = (checked: boolean) => {
    setStaffForm({
      ...staffForm,
      is_active: checked
    });
  };

  // Open staff dialog for creating new staff
  const handleAddStaff = () => {
    setSelectedStaffId(null);
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      is_active: true
    });
    setStaffDialogOpen(true);
  };

  // Open staff dialog for editing existing staff
  const handleEditStaff = (staffId: string) => {
    const staffMember = staff.find((s: any) => s.id === staffId);
    if (staffMember) {
      setSelectedStaffId(staffId);
      setStaffForm({
        name: staffMember.name || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        role: staffMember.role || '',
        is_active: staffMember.is_active !== false
      });
      setStaffDialogOpen(true);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (staffId: string) => {
    setSelectedStaffId(staffId);
    setDeleteDialogOpen(true);
  };

  // Submit staff form (create or update)
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (selectedStaffId) {
        // Update existing staff
        await updateStaff(selectedStaffId, staffForm);
        toast.success('Staff member updated successfully');
      } else {
        // Create new staff
        await createStaff(staffForm);
        toast.success('Staff member added successfully');
      }
      
      setStaffDialogOpen(false);
      refetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Failed to save staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async () => {
    if (!selectedStaffId) return;
    
    setIsSubmitting(true);
    try {
      await deleteStaff(selectedStaffId);
      toast.success('Staff member deleted successfully');
      setDeleteDialogOpen(false);
      refetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your business settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details and logo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input
                          id="business_name"
                          value={businessSettings.business_name}
                          onChange={(e) => setBusinessSettings({
                            ...businessSettings,
                            business_name: e.target.value
                          })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_phone">Phone Number</Label>
                        <Input
                          id="business_phone"
                          value={businessSettings.business_phone}
                          onChange={(e) => setBusinessSettings({
                            ...businessSettings,
                            business_phone: e.target.value
                          })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_address">Address</Label>
                        <Textarea
                          id="business_address"
                          value={businessSettings.business_address}
                          onChange={(e) => setBusinessSettings({
                            ...businessSettings,
                            business_address: e.target.value
                          })}
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Business Logo</Label>
                        <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-4">
                          {(logoPreview || businessSettings.logo_url) && (
                            <div className="w-full max-w-[200px] h-[100px] flex items-center justify-center overflow-hidden rounded-md bg-gray-50">
                              <img
                                src={logoPreview || businessSettings.logo_url}
                                alt="Business Logo"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="logo-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG or SVG (max. 2MB)</p>
                              </div>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <InvoiceSettings 
              businessSettings={businessSettings}
              setBusinessSettings={setBusinessSettings}
            />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>
                    Manage your staff members and their roles
                  </CardDescription>
                </div>
                <Button onClick={handleAddStaff} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Staff
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingStaff && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {!isLoadingStaff && staff.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No staff found
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {!isLoadingStaff && staff.length > 0 && staff.map((staffMember: any) => (
                      <TableRow key={staffMember.id}>
                        <TableCell className="font-medium">
                          {staffMember.name}
                          {!staffMember.is_active && (
                            <span className="ml-2 text-xs text-gray-500">(Inactive)</span>
                          )}
                        </TableCell>
                        <TableCell>{staffMember.email}</TableCell>
                        <TableCell>{staffMember.phone}</TableCell>
                        <TableCell>{staffMember.role}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStaff(staffMember.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(staffMember.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Customize your application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for the application
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important events
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes while editing
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Staff Dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={staffForm.name}
                onChange={handleStaffFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={staffForm.email}
                onChange={handleStaffFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={staffForm.phone}
                onChange={handleStaffFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={staffForm.role}
                onChange={handleStaffFormChange}
                placeholder="e.g. Mechanic, Manager, Receptionist"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={staffForm.is_active}
                onCheckedChange={handleStaffActiveToggle}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStaffDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteStaff}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Settings;
