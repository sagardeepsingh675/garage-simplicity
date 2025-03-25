
import React, { useState } from 'react';
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

interface Invoice {
  id: string;
  jobCardId: string;
  customerName: string;
  vehicleInfo: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  services: { name: string; cost: number }[];
  parts: { name: string; quantity: number; cost: number }[];
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    jobCardId: 'JC230925',
    customerName: 'Rajesh Kumar',
    vehicleInfo: 'Honda City - MH02AB1234',
    amount: 4500,
    date: '2023-09-27',
    status: 'paid',
    services: [
      { name: 'Oil Change', cost: 1200 },
      { name: 'Air Filter Replacement', cost: 800 },
      { name: 'Labor Charges', cost: 1000 }
    ],
    parts: [
      { name: 'Engine Oil (4L)', quantity: 1, cost: 1200 },
      { name: 'Air Filter', quantity: 1, cost: 500 }
    ]
  },
  {
    id: 'INV-002',
    jobCardId: 'JC230924',
    customerName: 'Priya Singh',
    vehicleInfo: 'Hyundai Creta - DL01CD5678',
    amount: 7800,
    date: '2023-09-26',
    status: 'pending',
    services: [
      { name: 'Brake Service', cost: 2500 },
      { name: 'Wheel Alignment', cost: 1800 },
      { name: 'Labor Charges', cost: 1500 }
    ],
    parts: [
      { name: 'Brake Pads (Set)', quantity: 1, cost: 1500 },
      { name: 'Brake Fluid', quantity: 1, cost: 500 }
    ]
  },
  {
    id: 'INV-003',
    jobCardId: 'JC230922',
    customerName: 'Amit Patel',
    vehicleInfo: 'Maruti Swift - GJ05EF9012',
    amount: 3200,
    date: '2023-09-24',
    status: 'overdue',
    services: [
      { name: 'AC Service', cost: 2000 },
      { name: 'Labor Charges', cost: 800 }
    ],
    parts: [
      { name: 'AC Gas Refill', quantity: 1, cost: 400 }
    ]
  }
];

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
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  
  const filteredInvoices = invoices.filter(invoice => 
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDialogOpen(true);
  };

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
                              <span>{invoice.customerName}</span>
                              <span className="text-sm text-muted-foreground">Job Card: {invoice.jobCardId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {invoice.vehicleInfo}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-medium">
                              <IndianRupee className="h-3 w-3" />
                              <span>{invoice.amount.toLocaleString('en-IN')}</span>
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
                                <DropdownMenuItem>Mark as paid</DropdownMenuItem>
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
                            <span>{invoice.customerName}</span>
                            <span className="text-sm text-muted-foreground">Job Card: {invoice.jobCardId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invoice.vehicleInfo}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            <span>{invoice.amount.toLocaleString('en-IN')}</span>
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
                            <span>{invoice.customerName}</span>
                            <span className="text-sm text-muted-foreground">Job Card: {invoice.jobCardId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invoice.vehicleInfo}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            <span>{invoice.amount.toLocaleString('en-IN')}</span>
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
                              <DropdownMenuItem>Mark as paid</DropdownMenuItem>
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
                            <span>{invoice.customerName}</span>
                            <span className="text-sm text-muted-foreground">Job Card: {invoice.jobCardId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {invoice.vehicleInfo}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            <span>{invoice.amount.toLocaleString('en-IN')}</span>
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
                              <DropdownMenuItem>Mark as paid</DropdownMenuItem>
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
                Job Card: {selectedInvoice.jobCardId} | Date: {new Date(selectedInvoice.date).toLocaleDateString('en-IN')}
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
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                    <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                    <p className="text-sm text-muted-foreground mt-1">customer@example.com</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Car className="h-4 w-4" /> Vehicle Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedInvoice.vehicleInfo}</p>
                    <p className="text-sm text-muted-foreground">Year: 2020</p>
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
                      {selectedInvoice.services.map((service, index) => (
                        <TableRow key={index}>
                          <TableCell>{service.name}</TableCell>
                          <TableCell className="text-right">{service.cost.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
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
                      {selectedInvoice.parts.map((part, index) => (
                        <TableRow key={index}>
                          <TableCell>{part.name}</TableCell>
                          <TableCell>{part.quantity}</TableCell>
                          <TableCell className="text-right">{part.cost.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {selectedInvoice.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                
                <div className="space-x-2">
                  {selectedInvoice.status !== 'paid' && (
                    <Button className="gap-1" variant="default">
                      <CreditCard className="h-4 w-4" /> Mark as Paid
                    </Button>
                  )}
                  <Button className="gap-1" variant="outline">
                    <Receipt className="h-4 w-4" /> Print Invoice
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Generate an invoice from job card or create a new one
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="job-card">Select Job Card (Optional)</Label>
              <Select>
                <SelectTrigger id="job-card">
                  <SelectValue placeholder="Select a job card" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jc1">JC230925 - Honda City</SelectItem>
                  <SelectItem value="jc2">JC230924 - Hyundai Creta</SelectItem>
                  <SelectItem value="jc3">JC230922 - Maruti Swift</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Selecting a job card will automatically populate service details
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer1">Rajesh Kumar</SelectItem>
                    <SelectItem value="customer2">Priya Singh</SelectItem>
                    <SelectItem value="customer3">Amit Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle1">Honda City - MH02AB1234</SelectItem>
                    <SelectItem value="vehicle2">Hyundai Creta - DL01CD5678</SelectItem>
                    <SelectItem value="vehicle3">Maruti Swift - GJ05EF9012</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Input placeholder="Service description" className="w-[60%]" />
                  <Input type="number" placeholder="Cost" className="w-[30%]" />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-1 w-full mt-2">
                  <Plus className="h-4 w-4" /> Add Service
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Parts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Input placeholder="Part name" className="w-[50%]" />
                  <Input type="number" placeholder="Qty" className="w-[15%]" />
                  <Input type="number" placeholder="Cost" className="w-[25%]" />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-1 w-full mt-2">
                  <Plus className="h-4 w-4" /> Add Part
                </Button>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input id="notes" placeholder="Any additional notes for the invoice" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsCreateInvoiceOpen(false)}>
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Billing;
