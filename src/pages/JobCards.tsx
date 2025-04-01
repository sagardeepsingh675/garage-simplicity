
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, FileText, Calendar, Car, User, CreditCard, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobCards, createJobCard, updateJobCardStatus, JobCard } from '@/services/jobCardService';
import { getVehicles } from '@/services/vehicleService';
import { getCustomers } from '@/services/customerService';
import { getStaff } from '@/services/staffService';
import { toast } from '@/lib/toast';
import { Link, useNavigate } from 'react-router-dom';
import { JobCardBilling } from '@/components/JobCardBilling';

type NewJobCard = Omit<JobCard, 'id'>;

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

const JobCards = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddJobCardOpen, setIsAddJobCardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newJobCard, setNewJobCard] = useState<NewJobCard>({
    vehicle_id: '',
    customer_id: '',
    issue_description: '',
    assigned_staff: '',
    status: 'pending',
    start_date: null,
    completion_date: null,
    diagnosis: null
  });
  
  const [selectedJobCardId, setSelectedJobCardId] = useState<string | null>(null);
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch job cards
  const { data: jobCards = [], isLoading } = useQuery({
    queryKey: ['jobCards'],
    queryFn: getJobCards
  });

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });

  // Fetch staff for dropdown
  const { data: staffMembers = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: getStaff
  });

  // Create job card mutation
  const createJobCardMutation = useMutation({
    mutationFn: createJobCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCards'] });
      setIsAddJobCardOpen(false);
      toast.success('Job card created successfully');
      resetJobCardForm();
    },
    onError: (error) => {
      toast.error('Failed to create job card');
      console.error(error);
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobCardId, status }: { jobCardId: string; status: string }) => 
      updateJobCardStatus(jobCardId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCards'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  });

  const handleCreateJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newJobCard.vehicle_id || !newJobCard.customer_id || !newJobCard.issue_description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    createJobCardMutation.mutate(newJobCard);
  };

  const resetJobCardForm = () => {
    setNewJobCard({
      vehicle_id: '',
      customer_id: '',
      issue_description: '',
      assigned_staff: '',
      status: 'pending',
      start_date: null,
      completion_date: null,
      diagnosis: null
    });
  };

  const handleStatusUpdate = (jobCardId: string, newStatus: string) => {
    if (updateStatusMutation.isPending) return;
    updateStatusMutation.mutate({ jobCardId, status: newStatus });
  };

  const handleGenerateInvoice = (jobCardId: string) => {
    setSelectedJobCardId(jobCardId);
    setIsBillingDialogOpen(true);
  };

  const handleBillingSuccess = () => {
    setIsBillingDialogOpen(false);
    setSelectedJobCardId(null);
  };

  const filteredJobCards = jobCards.filter(card => 
    (activeTab === 'all' || card.status === activeTab) &&
    (card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.vehicles?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.issue_description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Job Cards</h2>
            <p className="text-muted-foreground">Manage service job cards</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddJobCardOpen(true)}>
            <Plus className="h-4 w-4" /> Create Job Card
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search job cards..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead className="hidden lg:table-cell">Issue</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Loading job cards...
                    </TableCell>
                  </TableRow>
                ) : filteredJobCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No job cards found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobCards.map(card => (
                    <TableRow key={card.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-primary" />
                          <span>{card.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3 text-muted-foreground" />
                            {card.vehicles?.license_plate || 'N/A'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {card.vehicles?.make} {card.vehicles?.model}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{card.customers?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {card.issue_description}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(card.created_at || '').toLocaleDateString('en-IN')}
                          </span>
                          {card.completion_date && (
                            <span className="text-muted-foreground">
                              Completed: {new Date(card.completion_date).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(card.status)}>
                          {card.status === 'in-progress' ? 'In Progress' : 
                           card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                        </Badge>
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
                            <DropdownMenuItem asChild>
                              <Link to={`/vehicles/${card.vehicle_id}`}>View details</Link>
                            </DropdownMenuItem>
                            
                            {/* Generate Invoice option for completed job cards */}
                            {card.status === 'completed' && (
                              <DropdownMenuItem onClick={() => handleGenerateInvoice(card.id)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Generate Invoice
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(card.id, 'pending')}
                              disabled={card.status === 'pending'}
                            >
                              Set as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(card.id, 'in-progress')}
                              disabled={card.status === 'in-progress'}
                            >
                              Set as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(card.id, 'completed')}
                              disabled={card.status === 'completed'}
                            >
                              Set as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(card.id, 'cancelled')}
                              disabled={card.status === 'cancelled'}
                              className="text-destructive"
                            >
                              Set as Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Print job card</DropdownMenuItem>
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
      </div>
      
      <Dialog open={isAddJobCardOpen} onOpenChange={(open) => {
        setIsAddJobCardOpen(open);
        if (!open) resetJobCardForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Job Card</DialogTitle>
            <DialogDescription>
              Create a service job card for a vehicle
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateJobCard}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Select
                    value={newJobCard.vehicle_id}
                    onValueChange={(value) => setNewJobCard({...newJobCard, vehicle_id: value})}
                    required
                  >
                    <SelectTrigger id="vehicle">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={newJobCard.customer_id}
                    onValueChange={(value) => setNewJobCard({...newJobCard, customer_id: value})}
                    required
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technician">Assign To</Label>
                  <Select
                    value={newJobCard.assigned_staff}
                    onValueChange={(value) => setNewJobCard({...newJobCard, assigned_staff: value})}
                  >
                    <SelectTrigger id="technician">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Issue Description</Label>
                <Input 
                  id="description" 
                  placeholder="Describe the issue with the vehicle"
                  value={newJobCard.issue_description}
                  onChange={(e) => setNewJobCard({...newJobCard, issue_description: e.target.value})}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddJobCardOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createJobCardMutation.isPending}>
                {createJobCardMutation.isPending ? 'Creating...' : 'Create Job Card'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Invoice Generation Dialog */}
      <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for this job card
            </DialogDescription>
          </DialogHeader>
          
          {selectedJobCardId && (
            <JobCardBilling 
              jobCardId={selectedJobCardId} 
              onSuccess={handleBillingSuccess}
              onCancel={() => setIsBillingDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobCards;
