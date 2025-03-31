import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VehicleCanvas } from '@/components/VehicleCanvas';
import { AutoBillGenerator } from '@/components/AutoBillGenerator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, ChevronLeft, CircleCheck, Clock, Edit, User, Wrench, FileText, Info, Car, Plus, ArrowRight, IndianRupee } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getVehicleById, updateVehicle } from '@/services/vehicleService';
import { getCustomerById } from '@/services/customerService';
import { getStaff } from '@/services/staffService';
import { createJobCard, getJobCardsByVehicleId, updateJobCardStatus } from '@/services/jobCardService';
import { toast } from '@/lib/toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-muted text-muted-foreground';
    case 'in-progress':
      return 'bg-warning/10 text-warning';
    case 'completed':
      return 'bg-success/10 text-success';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isJobCardDialogOpen, setIsJobCardDialogOpen] = useState(false);
  const [isGenerateBillOpen, setIsGenerateBillOpen] = useState(false);
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState<any>(null);
  const queryClient = useQueryClient();
  const [newJobCard, setNewJobCard] = useState({
    issue_description: '',
    assigned_staff: '',
    status: 'pending',
    priority: 'medium'
  });
  
  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id || ''),
    enabled: !!id
  });

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', vehicle?.customer_id],
    queryFn: () => getCustomerById(vehicle?.customer_id || ''),
    enabled: !!vehicle?.customer_id
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: getStaff
  });

  const { data: jobCards = [], isLoading: isLoadingJobCards } = useQuery({
    queryKey: ['jobCards', id],
    queryFn: () => getJobCardsByVehicleId(id || ''),
    enabled: !!id
  });

  const updateVehicleMutation = useMutation({
    mutationFn: (data: any) => updateVehicle(id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      setIsEditVehicleOpen(false);
      toast.success('Vehicle updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update vehicle');
      console.error(error);
    }
  });

  const createJobCardMutation = useMutation({
    mutationFn: (data: any) => createJobCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCards', id] });
      setIsJobCardDialogOpen(false);
      toast.success('Job card created successfully');
      resetJobCardForm();
    },
    onError: (error) => {
      toast.error('Failed to create job card');
      console.error(error);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ jobCardId, status }: { jobCardId: string; status: string }) => 
      updateJobCardStatus(jobCardId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCards', id] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editVehicleData) {
      updateVehicleMutation.mutate(editVehicleData);
    }
  };

  const handleStartEdit = () => {
    if (vehicle) {
      setEditVehicleData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
        vin: vehicle.vin,
        color: vehicle.color
      });
      setIsEditVehicleOpen(true);
    }
  };
  
  const handleGenerateBill = (billData: any) => {
    toast.success(`Invoice created for ₹${billData.total.toLocaleString('en-IN')}`);
    setIsGenerateBillOpen(false);
  };

  const handleCreateJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle || !vehicle.id || !vehicle.customer_id) {
      toast.error('Vehicle or customer information is missing');
      return;
    }
    
    if (!newJobCard.issue_description) {
      toast.error('Please provide an issue description');
      return;
    }
    
    const jobCardData = {
      vehicle_id: vehicle.id,
      customer_id: vehicle.customer_id,
      issue_description: newJobCard.issue_description,
      assigned_staff: newJobCard.assigned_staff || null,
      status: 'pending',
      start_date: null,
      completion_date: null,
      diagnosis: null
    };
    
    createJobCardMutation.mutate(jobCardData);
  };
  
  const handleStatusUpdate = (jobCardId: string, newStatus: string) => {
    if (updateStatusMutation.isPending) return;
    updateStatusMutation.mutate({ jobCardId, status: newStatus });
  };
  
  const resetJobCardForm = () => {
    setNewJobCard({
      issue_description: '',
      assigned_staff: '',
      status: 'pending',
      priority: 'medium'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !vehicle) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Vehicle not found or error loading details.</p>
          <Button variant="outline" onClick={() => navigate('/vehicles')}>
            Back to Vehicles
          </Button>
        </div>
      </Layout>
    );
  }

  const activeJobCards = jobCards.filter(card => card.status !== 'completed' && card.status !== 'cancelled');
  const hasActiveJobCards = activeJobCards.length > 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Link to="/vehicles" className="hover:text-foreground transition-smooth inline-flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Vehicles</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{vehicle.license_plate || 'No Registration'}</h1>
              {hasActiveJobCards && (
                <Badge className="bg-warning/10 text-warning">In Service</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year || 'N/A'})</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleStartEdit}>
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" className="gap-1" onClick={() => setIsJobCardDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Create Job Card
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="condition">Condition</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
            <TabsTrigger value="jobs">Job Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Vehicle Information</CardTitle>
                    <Car className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Make</p>
                      <p className="font-medium">{vehicle.make}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">{vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{vehicle.year || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-medium">{vehicle.color || 'N/A'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">VIN</p>
                    <p className="font-medium">{vehicle.vin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(vehicle.updated_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Owner Information</CardTitle>
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{customer?.name || 'No owner assigned'}</p>
                  </div>
                  {customer && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium">{customer.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{customer.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{customer.address || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Service Information</CardTitle>
                    <Wrench className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasActiveJobCards ? (
                    <div className="space-y-3">
                      <p className="font-medium">Active Job Cards:</p>
                      {activeJobCards.map(card => (
                        <div key={card.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <Badge className={getStatusColor(card.status)}>
                              {card.status === 'in-progress' ? 'In Progress' : 
                              card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(card.created_at || '').toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1">{card.issue_description}</p>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('jobs')}>
                        View All Job Cards
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 text-center">
                      <p className="text-muted-foreground">No active service job</p>
                      <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsJobCardDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> Create Job Card
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="condition" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Condition</CardTitle>
                <CardDescription>
                  View the recorded condition and any damage to the vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VehicleCanvas vehicleType="sedan" viewOnly={true} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
                <CardDescription>
                  Complete service history for this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingJobCards ? (
                  <div className="pt-4 text-center">
                    <p className="text-muted-foreground">Loading service history...</p>
                  </div>
                ) : jobCards.length === 0 ? (
                  <div className="pt-4 text-center">
                    <p className="text-muted-foreground">No service history records found</p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsJobCardDialogOpen(true)}>
                      <Plus className="h-4 w-4" /> Create Job Card
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobCards.map((jobCard) => (
                      <Card key={jobCard.id} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(jobCard.status)}>
                                  {jobCard.status === 'in-progress' ? 'In Progress' : 
                                   jobCard.status.charAt(0).toUpperCase() + jobCard.status.slice(1)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(jobCard.created_at || '').toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-medium">{jobCard.issue_description}</h4>
                              {jobCard.diagnosis && (
                                <p className="text-sm text-muted-foreground">{jobCard.diagnosis}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {jobCard.assigned_staff && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {jobCard.staff?.name}
                                </Badge>
                              )}
                              {jobCard.completion_date && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  Completed: {new Date(jobCard.completion_date).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="jobs" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Job Cards</CardTitle>
                    <CardDescription>
                      Manage job cards for this vehicle
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-1" onClick={() => setIsJobCardDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Create Job Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingJobCards ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Loading job cards...</p>
                  </div>
                ) : jobCards.length === 0 ? (
                  <div className="pt-4 text-center">
                    <p className="text-muted-foreground">No job cards found for this vehicle</p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsJobCardDialogOpen(true)}>
                      <Plus className="h-4 w-4" /> Create Job Card
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {jobCards.map((jobCard: any) => (
                      <Card key={jobCard.id} className="border border-border/40">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Job Card #{jobCard.id.substring(0, 8).toUpperCase()}
                              </h3>
                              <p className="text-sm text-muted-foreground">{jobCard.issue_description}</p>
                            </div>
                            <Badge className={getStatusColor(jobCard.status)}>
                              {jobCard.status === 'in-progress' ? 'In Progress' : 
                               jobCard.status.charAt(0).toUpperCase() + jobCard.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-sm">
                              <p className="text-muted-foreground">Created on</p>
                              <p>{new Date(jobCard.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground">Last Updated</p>
                              <p>{new Date(jobCard.updated_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground">Assigned to</p>
                              <p>{jobCard.staff ? jobCard.staff.name : 'Not assigned'}</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground">Status</p>
                              <p className="capitalize">
                                {jobCard.status === 'in-progress' ? 'In Progress' : jobCard.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-between items-center">
                            <div className="space-x-2 mb-2 md:mb-0">
                              {jobCard.status !== 'completed' && (
                                <>
                                  {jobCard.status !== 'in-progress' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleStatusUpdate(jobCard.id, 'in-progress')}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Start Service
                                    </Button>
                                  )}
                                  {jobCard.status === 'in-progress' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStatusUpdate(jobCard.id, 'completed')}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Complete Service
                                    </Button>
                                  )}
                                </>
                              )}
                              {jobCard.status !== 'cancelled' && jobCard.status !== 'completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleStatusUpdate(jobCard.id, 'cancelled')}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsGenerateBillOpen(true)}>
                              <IndianRupee className="h-4 w-4" /> Generate Bill
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isJobCardDialogOpen} onOpenChange={(open) => {
        setIsJobCardDialogOpen(open);
        if (!open) resetJobCardForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Job Card</DialogTitle>
            <DialogDescription>
              Create a new service job card for {vehicle.make} {vehicle.model}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateJobCard}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Description</Label>
                <Input 
                  id="issue" 
                  placeholder="Describe the issue with the vehicle" 
                  value={newJobCard.issue_description}
                  onChange={(e) => setNewJobCard({...newJobCard, issue_description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mechanic">Assign Mechanic</Label>
                  <Select 
                    value={newJobCard.assigned_staff}
                    onValueChange={(value) => setNewJobCard({...newJobCard, assigned_staff: value})}
                  >
                    <SelectTrigger id="mechanic">
                      <SelectValue placeholder="Select mechanic" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff: any) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newJobCard.priority}
                    onValueChange={(value) => setNewJobCard({...newJobCard, priority: value})}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsJobCardDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createJobCardMutation.isPending}>
                {createJobCardMutation.isPending ? 'Creating...' : 'Create Job Card'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditVehicleOpen} onOpenChange={setIsEditVehicleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update vehicle information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-make">Make</Label>
                  <Input 
                    id="edit-make" 
                    value={editVehicleData?.make || ''} 
                    onChange={(e) => setEditVehicleData({...editVehicleData, make: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input 
                    id="edit-model" 
                    value={editVehicleData?.model || ''} 
                    onChange={(e) => setEditVehicleData({...editVehicleData, model: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input 
                    id="edit-year" 
                    type="number" 
                    value={editVehicleData?.year || ''} 
                    onChange={(e) => setEditVehicleData({...editVehicleData, year: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <Input 
                    id="edit-color" 
                    value={editVehicleData?.color || ''} 
                    onChange={(e) => setEditVehicleData({...editVehicleData, color: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-license">License Plate</Label>
                <Input 
                  id="edit-license" 
                  value={editVehicleData?.license_plate || ''} 
                  onChange={(e) => setEditVehicleData({...editVehicleData, license_plate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vin">VIN</Label>
                <Input 
                  id="edit-vin" 
                  value={editVehicleData?.vin || ''} 
                  onChange={(e) => setEditVehicleData({...editVehicleData, vin: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditVehicleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateVehicleMutation.isPending}>
                {updateVehicleMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isGenerateBillOpen} onOpenChange={setIsGenerateBillOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Generate an invoice for completed services
            </DialogDescription>
          </DialogHeader>
          <AutoBillGenerator 
            vehicleData={vehicle} 
            customerData={customer || undefined}
            onGenerateBill={handleGenerateBill}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default VehicleDetail;
