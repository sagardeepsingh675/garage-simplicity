import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreHorizontal, FileText, CreditCard, CalendarIcon, IndianRupee, Receipt, User, Car } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoices, getInvoiceById, updateInvoiceStatus, createInvoice, Invoice } from '@/services/billing';
import { getJobCards, getJobCardById } from '@/services/jobCardService';
import { getCustomers } from '@/services/customerService';
import { getVehicles } from '@/services/vehicleService';
import { BillingForm } from '@/components/BillingForm';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from '@/lib/toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-success/10 text-success hover:bg-success/20';
    case 'pending':
      return 'bg-warning/10 text-warning hover:bg-warning/20';
    case 'overdue':
      return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Setup realtime updates
  useRealtime({
    table: 'invoices',
    callback: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    showToasts: true
  });

  // Fetch data from Supabase
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices
  });

  const { data: jobCards = [], isLoading: isLoadingJobCards } = useQuery({
    queryKey: ['jobCards'],
    queryFn: getJobCards
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Invoice['status'] }) => 
      updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsInvoiceDialogOpen(false);
    }
  });

  const filteredInvoices = invoices.filter(invoice => 
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.customers?.name && invoice.customers.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (invoice.job_cards?.vehicles && 
      `${invoice.job_cards.vehicles.make} ${invoice.job_cards.vehicles.model} ${invoice.job_cards.vehicles.license_plate || ''}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      const fullInvoice = await getInvoiceById(invoice.id);
      if (fullInvoice) {
        setSelectedInvoice(fullInvoice as Invoice);
        setIsInvoiceDialogOpen(true);
      }
    } catch (error) {
      console.error('Error viewing invoice:', error);
      toast.error('Failed to load invoice details');
    }
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ id: invoiceId, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update invoice status');
    }
  };

  const handleInvoiceCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    setIsCreateInvoiceOpen(false);
    setSelectedJobCard(null);
  };

  const isLoading = isLoadingInvoices || isLoadingJobCards;

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
              <p className="text-muted-foreground">Loading billing data...</p>
            </div>
            <Button className="gap-2" disabled>
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </div>
          <Card className="animate-pulse">
            <CardContent className="p-0">
              <div className="h-96 flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateInvoiceOpen(true)}>
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice #, customer, vehicle..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Tab content for different invoice statuses */}
          <TabsContent value="all" className="mt-4">
            <Card className="overflow-hidden border border-border/50 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map(invoice => (
                        <TableRow key={invoice.id} className="hover:bg-muted/30 transition-smooth">
                          <TableCell className="font-medium">
                            <button 
                              className="text-primary hover:underline" 
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              {invoice.id}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{invoice.customers?.name || 'N/A'}</span>
                              <span className="text-sm text-muted-foreground">Job Card: {invoice.job_card_id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {invoice.job_cards?.vehicles ? 
                              `${invoice.job_cards.vehicles.make} ${invoice.job_cards.vehicles.model} ${invoice.job_cards.vehicles.license_plate ? `- ${invoice.job_cards.vehicles.license_plate}` : ''}` 
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{new Date(invoice.created_at).toLocaleDateString('en-IN')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-medium">
                              <IndianRupee className="h-3 w-3" />
                              <span>{invoice.grand_total.toLocaleString('en-IN')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(invoice.status)}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                  View invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit invoice</DropdownMenuItem>
                                {invoice.status !== 'paid' && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'paid')}>
                                    Mark as paid
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>Send to customer</DropdownMenuItem>
                                <DropdownMenuItem>Print invoice</DropdownMenuItem>
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
          
          {/* Tab content for Paid, Pending, Overdue tabs */}
          <TabsContent value="paid" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.filter(inv => inv.status === 'paid').map(invoice => (
                      <TableRow key={invoice.id} className="hover:bg-muted/30 transition-smooth">
                        <TableCell className="font-medium">
                          <button 
                            className="text-primary hover:underline" 
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            {invoice.id}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{invoice.customers?.name || 'N/A'}</span>
                            <span className="text-sm text-muted-foreground">Job Card: {invoice.job_card_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invoice.job_cards?.vehicles ? `${invoice.job_cards.vehicles.make} ${invoice.job_cards.vehicles.model} - ${invoice.job_cards.vehicles.license_plate}` : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(invoice.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            <span>{invoice.grand_total.toLocaleString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                View invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>Print invoice</DropdownMenuItem>
                              <DropdownMenuItem>Send receipt</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.filter(inv => inv.status === 'pending').map(invoice => (
                      <TableRow key={invoice.id} className="hover:bg-muted/30 transition-smooth">
                        <TableCell className="font-medium">
                          <button 
                            className="text-primary hover:underline" 
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            {invoice.id}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{invoice.customers?.name || 'N/A'}</span>
                            <span className="text-sm text-muted-foreground">Job Card: {invoice.job_card_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invoice.job_cards?.vehicles ? `${invoice.job_cards.vehicles.make} ${invoice.job_cards.vehicles.model} - ${invoice.job_cards.vehicles.license_plate}` : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(invoice.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            <span>{invoice.grand_total.toLocaleString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                View invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'paid')}>
                                Mark as paid
                              </DropdownMenuItem>
                              <DropdownMenuItem>Send reminder</DropdownMenuItem>
                              <DropdownMenuItem>Edit invoice</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.filter(inv => inv.status === 'overdue').map(invoice => (
                      <TableRow key={invoice.id} className="hover:bg-muted/30 transition-smooth">
                        <TableCell className="font-medium">
                          <button 
                            className="text-primary hover:underline" 
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            {invoice.id}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{invoice.customers?.name || 'N/A'}</span>
                            <span className="text-sm text-muted-foreground">Job Card: {invoice.job_card_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invoice.job_cards?.vehicles ? `${invoice.job_cards.vehicles.make} ${invoice.job_cards.vehicles.model} - ${invoice.job_cards.vehicles.license_plate}` : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(invoice.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            <span>{invoice.grand_total.toLocaleString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                View invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.id, 'paid')}>
                                Mark as paid
                              </DropdownMenuItem>
                              <DropdownMenuItem>Send urgent reminder</DropdownMenuItem>
                              <DropdownMenuItem>Edit invoice</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Invoice detail dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        {selectedInvoice && (
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Invoice {selectedInvoice.id}</span>
                <Badge className={`${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Job Card: {selectedInvoice.job_card_id} | Date: {new Date(selectedInvoice.created_at).toLocaleDateString('en-IN')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" /> Customer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedInvoice.customers?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customers?.phone || 'No phone'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedInvoice.customers?.email || 'No email'}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Car className="h-4 w-4" /> Vehicle Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {selectedInvoice.job_cards?.vehicles ? 
                        `${selectedInvoice.job_cards.vehicles.make} ${selectedInvoice.job_cards.vehicles.model} ${selectedInvoice.job_cards.vehicles.license_plate ? `- ${selectedInvoice.job_cards.vehicles.license_plate}` : ''}` 
                        : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Year: {selectedInvoice.job_cards?.vehicles?.year || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.services && selectedInvoice.services.length > 0 ? (
                        selectedInvoice.services.map((service, index) => (
                          <TableRow key={index}>
                            <TableCell>{service.name}</TableCell>
                            <TableCell className="text-right">{service.cost.toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">No services</TableCell>
                        </TableRow>
                      )}
                      {selectedInvoice.services && selectedInvoice.services.length > 0 && (
                        <TableRow>
                          <TableCell className="font-medium">Services Subtotal</TableCell>
                          <TableCell className="text-right font-medium">
                            {selectedInvoice.services.reduce((sum, service) => sum + (service.cost || 0), 0).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Parts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.parts && selectedInvoice.parts.length > 0 ? (
                        selectedInvoice.parts.map((part, index) => (
                          <TableRow key={index}>
                            <TableCell>{part.name}</TableCell>
                            <TableCell>{part.quantity}</TableCell>
                            <TableCell className="text-right">{(part.cost * part.quantity).toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">No parts</TableCell>
                        </TableRow>
                      )}
                      {selectedInvoice.parts && selectedInvoice.parts.length > 0 && (
                        <TableRow>
                          <TableCell className="font-medium">Parts Subtotal</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right font-medium">
                            {selectedInvoice.parts.reduce((sum, part) => sum + ((part.cost || 0) * (part.quantity || 0)), 0).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tax Amount</p>
                  <p className="text-lg font-medium flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {selectedInvoice.tax_amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {selectedInvoice.grand_total.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              
              <div className="space-x-2">
                {selectedInvoice.status !== 'paid' && (
                  <Button 
                    className="gap-1" 
                    variant="default"
                    onClick={() => handleStatusUpdate(selectedInvoice.id, 'paid')}
                  >
                    <CreditCard className="h-4 w-4" /> Mark as Paid
                  </Button>
                )}
                <Button className="gap-1" variant="outline">
                  <Receipt className="h-4 w-4" /> Print Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Create invoice dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Select a job card and add items from inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2 mb-6">
              <Label htmlFor="job-card">Select Job Card</Label>
              <Select value={selectedJobCard || ''} onValueChange={setSelectedJobCard}>
                <SelectTrigger id="job-card">
                  <SelectValue placeholder="Select a job card" />
                </SelectTrigger>
                <SelectContent>
                  {jobCards.map(jobCard => (
                    <SelectItem key={jobCard.id} value={jobCard.id}>
                      {jobCard.id} - {jobCard.vehicles?.make} {jobCard.vehicles?.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select a job card to create an invoice with parts and services
              </p>
            </div>
            
            {selectedJobCard ? (
              <BillingForm 
                jobCardId={selectedJobCard}
                onSuccess={handleInvoiceCreated}
              />
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">Please select a job card first</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Billing;
