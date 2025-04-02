
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, FilePlus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from '@/lib/toast';
import { getJobCardDetails, createInvoice, InvoiceItem, InvoiceService } from '@/services/billingService';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

type JobCardBillingProps = {
  jobCardId: string;
  onCancel: () => void;
  onSuccess: () => void;
};

export function JobCardBilling({ jobCardId, onCancel, onSuccess }: JobCardBillingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [jobCardData, setJobCardData] = useState<any>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // Default to 15 days from now
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [selectedParts, setSelectedParts] = useState<InvoiceItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<InvoiceService[]>([]);
  
  // Calculate totals
  const subTotal = 
    selectedParts.reduce((sum, part) => sum + part.total, 0) +
    selectedServices.reduce((sum, service) => sum + service.total, 0);
  
  const taxRate = 0.18; // 18% GST
  const taxAmount = subTotal * taxRate;
  const grandTotal = subTotal + taxAmount;
  
  useEffect(() => {
    async function loadJobCardData() {
      try {
        setIsLoading(true);
        const data = await getJobCardDetails(jobCardId);
        setJobCardData(data);
        
        // Pre-select all parts and services
        setSelectedParts(data.parts || []);
        setSelectedServices(data.services || []);
      } catch (error) {
        console.error('Error loading job card details:', error);
        toast.error('Failed to load job card details');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (jobCardId) {
      loadJobCardData();
    }
  }, [jobCardId]);
  
  const handleTogglePart = (part: InvoiceItem, checked: boolean) => {
    if (checked) {
      setSelectedParts(prev => [...prev, part]);
    } else {
      setSelectedParts(prev => prev.filter(p => p.id !== part.id));
    }
  };
  
  const handleToggleService = (service: InvoiceService, checked: boolean) => {
    if (checked) {
      setSelectedServices(prev => [...prev, service]);
    } else {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    }
  };
  
  const handleCreateInvoice = async () => {
    if (!jobCardData || !jobCardData.jobCard) {
      toast.error('Job card data is missing');
      return;
    }
    
    if (selectedParts.length === 0 && selectedServices.length === 0) {
      toast.error('Please select at least one part or service');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const invoiceData = {
        customer_id: jobCardData.jobCard.customer_id,
        job_card_id: jobCardId,
        total_amount: subTotal,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        due_date: dueDate ? dueDate.toISOString() : undefined,
        status: 'unpaid' as const,
        notes,
        parts: selectedParts,
        services: selectedServices
      };
      
      const createdInvoice = await createInvoice(invoiceData);
      
      if (createdInvoice) {
        toast.success('Invoice created successfully');
        onSuccess();
        navigate(`/billing?invoice=${createdInvoice.id}`);
      } else {
        toast.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading job card details...</span>
      </div>
    );
  }
  
  if (!jobCardData) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Failed to load job card details</p>
        <Button onClick={onCancel} className="mt-4">Back</Button>
      </div>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-semibold">Create Invoice for Job Card</h2>
        <p className="text-sm text-muted-foreground">
          Generate an invoice from job card #{jobCardId.substring(0, 8)}
        </p>
      </div>
      
      {/* Customer & Vehicle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{jobCardData.jobCard.customers?.name}</p>
              <p className="text-sm text-muted-foreground">{jobCardData.jobCard.customers?.phone}</p>
              <p className="text-sm text-muted-foreground">{jobCardData.jobCard.customers?.email}</p>
              <p className="text-sm text-muted-foreground">{jobCardData.jobCard.customers?.address}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">
                {jobCardData.jobCard.vehicles?.make} {jobCardData.jobCard.vehicles?.model}
              </p>
              <p className="text-sm text-muted-foreground">
                License: {jobCardData.jobCard.vehicles?.license_plate}
              </p>
              <p className="text-sm text-muted-foreground">
                Year: {jobCardData.jobCard.vehicles?.year}
              </p>
              <p className="text-sm text-muted-foreground">
                Color: {jobCardData.jobCard.vehicles?.color}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Parts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Parts Used</CardTitle>
          <CardDescription>Select the parts to include in the invoice</CardDescription>
        </CardHeader>
        <CardContent>
          {jobCardData.parts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Include</TableHead>
                  <TableHead>Part</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCardData.parts.map((part: InvoiceItem) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedParts.some(p => p.id === part.id)}
                        onCheckedChange={(checked) => handleTogglePart(part, checked === true)}
                      />
                    </TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>{formatCurrency(part.price)}</TableCell>
                    <TableCell>{formatCurrency(part.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No parts used in this job card</p>
          )}
        </CardContent>
      </Card>
      
      {/* Services */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Services Performed</CardTitle>
          <CardDescription>Select the services to include in the invoice</CardDescription>
        </CardHeader>
        <CardContent>
          {jobCardData.services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Include</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCardData.services.map((service: InvoiceService) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedServices.some(s => s.id === service.id)}
                        onCheckedChange={(checked) => handleToggleService(service, checked === true)}
                      />
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.hours}</TableCell>
                    <TableCell>{formatCurrency(service.rate)}</TableCell>
                    <TableCell>{formatCurrency(service.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No services performed in this job card</p>
          )}
        </CardContent>
      </Card>
      
      {/* Invoice Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes to the invoice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (18% GST)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateInvoice}
            disabled={isSubmitting || (selectedParts.length === 0 && selectedServices.length === 0)}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FilePlus className="h-4 w-4" />
                Create Invoice
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
