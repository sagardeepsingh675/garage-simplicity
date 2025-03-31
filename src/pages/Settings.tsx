import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, Image, Phone, User, UserPlus, Key, ShieldCheck, MoreHorizontal, UserCircle, Receipt } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { getBusinessSettings, updateBusinessSettings, uploadLogo, BusinessSettings } from '@/services/businessSettingsService';
import { createStaffUser, getStaffUsers, updateStaffUser, deleteStaffUser, resetStaffPassword, StaffUser, StaffPermission } from '@/services/staffAuthService';
import { InvoiceSettings } from '@/components/InvoiceSettings';

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('business');
  
  // Business Settings State
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    business_name: '',
    business_address: '',
    business_phone: '',
    logo_url: '',
    invoice_prefix: 'INV',
    next_invoice_number: 1001,
    gst_number: '',
    gst_percentage: 0,
    show_gst_on_invoice: false
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Query for fetching business settings
  const businessSettingsQuery = useQuery({
    queryKey: ['businessSettings'],
    queryFn: getBusinessSettings
  });
  
  // Update business settings when data is fetched
  useEffect(() => {
    if (businessSettingsQuery.data) {
      const data = businessSettingsQuery.data as BusinessSettings;
      setBusinessSettings({
        ...data,
        invoice_prefix: data.invoice_prefix || 'INV',
        next_invoice_number: data.next_invoice_number || 1001,
        gst_number: data.gst_number || '',
        gst_percentage: data.gst_percentage || 0,
        show_gst_on_invoice: data.show_gst_on_invoice || false
      });
      setLogoPreview(data.logo_url || null);
    }
  }, [businessSettingsQuery.data]);
  
  // Staff Management State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [newStaff, setNewStaff] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'staff',
    permissions: [] as StaffPermission[]
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Available permissions
  const availablePermissions: { value: StaffPermission, label: string }[] = [
    { value: 'customers', label: 'Customers' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'job_cards', label: 'Job Cards' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'billing', label: 'Billing' },
    { value: 'staff', label: 'Staff Management' },
    { value: 'settings', label: 'Settings' }
  ];
  
  // Mutation for updating business settings
  const updateBusinessSettingsMutation = useMutation({
    mutationFn: async (settings: BusinessSettings) => {
      let logoUrl = settings.logo_url;
      
      // Upload logo if a new file was selected
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }
      
      return updateBusinessSettings({
        ...settings,
        logo_url: logoUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessSettings'] });
      toast.success('Business settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update business settings');
      console.error(error);
    }
  });
  
  // Mutation for creating staff user
  const createStaffUserMutation = useMutation({
    mutationFn: (staffData: typeof newStaff) => {
      return createStaffUser(
        staffData.email,
        staffData.password,
        staffData.name,
        staffData.role,
        staffData.permissions
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      resetStaffForm();
      setIsAddStaffOpen(false);
    },
    onError: (error) => {
      console.error(error);
    }
  });
  
  // Mutation for updating staff user
  const updateStaffUserMutation = useMutation({
    mutationFn: (staffData: { id: string, updates: Partial<StaffUser> }) => {
      return updateStaffUser(staffData.id, staffData.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      setIsEditStaffOpen(false);
      setSelectedStaff(null);
    },
    onError: (error) => {
      console.error(error);
    }
  });
  
  // Mutation for deleting staff user
  const deleteStaffUserMutation = useMutation({
    mutationFn: deleteStaffUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
    },
    onError: (error) => {
      console.error(error);
    }
  });
  
  // Mutation for resetting staff password
  const resetStaffPasswordMutation = useMutation({
    mutationFn: (data: { id: string, password: string }) => {
      return resetStaffPassword(data.id, data.password);
    },
    onSuccess: () => {
      setIsResetPasswordOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (error) => {
      console.error(error);
    }
  });
  
  // Handle file input change for logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLogoFile(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle business settings form submission
  const handleBusinessSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSettingsMutation.mutate(businessSettings);
  };
  
  // Handle adding new staff user
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.email || !newStaff.password || !newStaff.name) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (newStaff.password !== newStaff.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    createStaffUserMutation.mutate(newStaff);
  };
  
  // Handle updating staff user
  const handleUpdateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    updateStaffUserMutation.mutate({
      id: selectedStaff.id,
      updates: {
        name: selectedStaff.name,
        role: selectedStaff.role,
        permissions: selectedStaff.permissions
      }
    });
  };
  
  // Handle password reset
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    resetStaffPasswordMutation.mutate({
      id: selectedStaff.id,
      password: newPassword
    });
  };
  
  // Toggle permission checkbox
  const togglePermission = (permission: StaffPermission) => {
    const currentPermissions = newStaff.permissions || [];
    if (currentPermissions.includes(permission)) {
      setNewStaff({
        ...newStaff,
        permissions: currentPermissions.filter(p => p !== permission)
      });
    } else {
      setNewStaff({
        ...newStaff,
        permissions: [...currentPermissions, permission]
      });
    }
  };
  
  // Toggle permission checkbox for selected staff
  const toggleSelectedStaffPermission = (permission: StaffPermission) => {
    if (!selectedStaff) return;
    
    const currentPermissions = selectedStaff.permissions || [];
    if (currentPermissions.includes(permission)) {
      setSelectedStaff({
        ...selectedStaff,
        permissions: currentPermissions.filter(p => p !== permission)
      });
    } else {
      setSelectedStaff({
        ...selectedStaff,
        permissions: [...currentPermissions, permission]
      });
    }
  };
  
  // Reset staff form
  const resetStaffForm = () => {
    setNewStaff({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'staff',
      permissions: []
    });
  };
  
  // Handle delete staff
  const handleDeleteStaff = (id: string) => {
    if (confirm('Are you sure you want to delete this staff user? This action cannot be undone.')) {
      deleteStaffUserMutation.mutate(id);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your business settings and staff accounts</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-auto">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden md:inline">Business Information</span>
              <span className="inline md:hidden">Business</span>
            </TabsTrigger>
            <TabsTrigger value="invoice" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden md:inline">Invoice Settings</span>
              <span className="inline md:hidden">Invoice</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span>Staff Access</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Business Information Tab */}
          <TabsContent value="business" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details and logo that will appear on invoices and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessSettingsSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="business_name" className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Business Name
                        </Label>
                        <Input 
                          id="business_name" 
                          value={businessSettings.business_name}
                          onChange={(e) => setBusinessSettings({...businessSettings, business_name: e.target.value})}
                          placeholder="Your Garage Name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_address" className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Business Address
                        </Label>
                        <Textarea 
                          id="business_address" 
                          value={businessSettings.business_address}
                          onChange={(e) => setBusinessSettings({...businessSettings, business_address: e.target.value})}
                          placeholder="123 Garage Street, City, Country"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Business Phone
                        </Label>
                        <Input 
                          id="business_phone" 
                          value={businessSettings.business_phone}
                          onChange={(e) => setBusinessSettings({...businessSettings, business_phone: e.target.value})}
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="logo" className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Business Logo
                        </Label>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 h-52">
                          {logoPreview ? (
                            <div className="text-center">
                              <img 
                                src={logoPreview} 
                                alt="Logo Preview" 
                                className="max-h-32 max-w-full mx-auto mb-4 object-contain"
                              />
                              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
                                Change Logo
                                <input
                                  type="file"
                                  id="logo"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleLogoChange}
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center">
                              <Image className="h-12 w-12 text-muted-foreground mb-4" />
                              <span className="text-sm text-muted-foreground mb-2">Click to upload your logo</span>
                              <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
                                Upload Logo
                                <input
                                  type="file"
                                  id="logo"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleLogoChange}
                                />
                              </span>
                            </label>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Recommended: Square image of at least 200x200 pixels (PNG, JPG, SVG)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateBusinessSettingsMutation.isPending}
                    >
                      {updateBusinessSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Invoice Settings Tab */}
          <TabsContent value="invoice" className="space-y-6 pt-4">
            <form onSubmit={handleBusinessSettingsSubmit} className="space-y-6">
              <InvoiceSettings 
                businessSettings={businessSettings}
                setBusinessSettings={setBusinessSettings}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateBusinessSettingsMutation.isPending}
                >
                  {updateBusinessSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          {/* Staff Access Tab */}
          <TabsContent value="staff" className="space-y-6 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>
                    Create and manage staff accounts and permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddStaffOpen(true)} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Staff
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffUsersQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Loading staff users...
                        </TableCell>
                      </TableRow>
                    ) : staffUsersQuery.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No staff users found. Click "Add Staff" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      staffUsersQuery.data?.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {staff.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{staff.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{staff.email}</TableCell>
                          <TableCell>
                            <Badge variant={staff.role === 'admin' ? 'default' : 'secondary'}>
                              {staff.role === 'admin' ? 'Administrator' : 'Staff'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {staff.permissions.map((permission, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedStaff(staff);
                                  setIsEditStaffOpen(true);
                                }}>
                                  Edit staff
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedStaff(staff);
                                  setIsResetPasswordOpen(true);
                                }}>
                                  Reset password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteStaff(staff.id)}>
                                  Delete staff
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={(open) => {
        setIsAddStaffOpen(open);
        if (!open) resetStaffForm();
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Staff User</DialogTitle>
            <DialogDescription>
              Create a new staff account with specific permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaffSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff-name" className="text-right">
                  Full Name
                </Label>
                <Input 
                  id="staff-name" 
                  className="col-span-3" 
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff-email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="staff-email" 
                  type="email" 
                  className="col-span-3" 
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff-password" className="text-right">
                  Password
                </Label>
                <Input 
                  id="staff-password" 
                  type="password" 
                  className="col-span-3" 
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff-confirm-password" className="text-right">
                  Confirm
                </Label>
                <Input 
                  id="staff-confirm-password" 
                  type="password" 
                  className="col-span-3" 
                  value={newStaff.confirmPassword}
                  onChange={(e) => setNewStaff({...newStaff, confirmPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff-role" className="text-right">
                  Role
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="staff-role-admin" 
                      checked={newStaff.role === 'admin'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewStaff({
                            ...newStaff, 
                            role: 'admin',
                            permissions: ['customers', 'vehicles', 'job_cards', 'inventory', 'billing', 'staff', 'settings']
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor="staff-role-admin" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Administrator (all permissions)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox 
                      id="staff-role-staff" 
                      checked={newStaff.role === 'staff'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewStaff({
                            ...newStaff, 
                            role: 'staff',
                            permissions: []
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor="staff-role-staff" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Staff (custom permissions)
                    </label>
                  </div>
                </div>
              </div>
              
              {newStaff.role === 'staff' && (
                <div className="grid grid-cols-4 gap-4">
                  <Label className="text-right pt-2">
                    Permissions
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {availablePermissions.map((permission) => (
                      <div key={permission.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`permission-${permission.value}`} 
                          checked={newStaff.permissions.includes(permission.value)}
                          onCheckedChange={() => togglePermission(permission.value)}
                        />
                        <label 
                          htmlFor={`permission-${permission.value}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddStaffOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createStaffUserMutation.isPending}>
                {createStaffUserMutation.isPending ? 'Creating...' : 'Create Staff User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Staff Dialog */}
      <Dialog open={isEditStaffOpen} onOpenChange={(open) => {
        setIsEditStaffOpen(open);
        if (!open) setSelectedStaff(null);
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Staff User</DialogTitle>
            <DialogDescription>
              Update staff information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleUpdateStaffSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-staff-name" className="text-right">
                    Full Name
                  </Label>
                  <Input 
                    id="edit-staff-name" 
                    className="col-span-3" 
                    value={selectedStaff.name}
                    onChange={(e) => setSelectedStaff({...selectedStaff, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-staff-email" className="text-right">
                    Email
                  </Label>
                  <Input 
                    id="edit-staff-email" 
                    type="email" 
                    className="col-span-3" 
                    value={selectedStaff.email}
                    disabled
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-staff-role" className="text-right">
                    Role
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-staff-role-admin" 
                        checked={selectedStaff.role === 'admin'}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStaff({
                              ...selectedStaff, 
                              role: 'admin',
                              permissions: ['customers', 'vehicles', 'job_cards', 'inventory', 'billing', 'staff', 'settings']
                            });
                          }
                        }}
                      />
                      <label 
                        htmlFor="edit-staff-role-admin" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Administrator (all permissions)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox 
                        id="edit-staff-role-staff" 
                        checked={selectedStaff.role === 'staff'}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStaff({
                              ...selectedStaff, 
                              role: 'staff',
                              permissions: []
                            });
                          }
                        }}
                      />
                      <label 
                        htmlFor="edit-staff-role-staff" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Staff (custom permissions)
                      </label>
                    </div>
                  </div>
                </div>
                
                {selectedStaff.role === 'staff' && (
                  <div className="grid grid-cols-4 gap-4">
                    <Label className="text-right pt-2">
                      Permissions
                    </Label>
                    <div className="col-span-3 space-y-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-permission-${permission.value}`} 
                            checked={selectedStaff.permissions.includes(permission.value)}
                            onCheckedChange={() => toggleSelectedStaffPermission(permission.value)}
                          />
                          <label 
                            htmlFor={`edit-permission-${permission.value}`} 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditStaffOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateStaffUserMutation.isPending}>
                  {updateStaffUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={(open) => {
        setIsResetPasswordOpen(open);
        if (!open) {
          setNewPassword('');
          setConfirmNewPassword('');
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedStaff?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPasswordSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-password" className="text-right">
                  New Password
                </Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  className="col-span-3" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirm-new-password" className="text-right">
                  Confirm
                </Label>
                <Input 
                  id="confirm-new-password" 
                  type="password" 
                  className="col-span-3" 
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsResetPasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetStaffPasswordMutation.isPending}>
                {resetStaffPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Settings;
