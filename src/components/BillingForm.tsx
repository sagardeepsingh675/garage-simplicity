
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, IndianRupee, Trash, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '@/services/inventoryService';
import { getAllJobCards, getJobCardById, getJobCardItems, getJobCardServices } from '@/services/jobCardService';
import { createInvoice, InvoiceItem, InvoiceService } from '@/services/billingService';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface BillingFormProps {
  jobCardId?: string;
  onSuccess?: () => void;
}

export function BillingForm({ jobCardId: initialJobCardId, onSuccess }: BillingFormProps) {
  const [selectedJobCardId, setSelectedJobCardId] = useState(initialJobCardId || '');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [services, setServices] = useState<InvoiceService[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000));

  // Job card query
  const { data: jobCard } = useQuery({
    queryKey: ['jobCard', selectedJobCardId],
    queryFn: () => getJobCardById(selectedJobCardId),
    enabled: !!selectedJobCardId
  });

  // Job card items query
  const { data: jobCardItems = [] } = useQuery({
    queryKey: ['jobCardItems', selectedJobCardId],
    queryFn: () => getJobCardItems(selectedJobCardId),
    enabled: !!selectedJobCardId
  });

  // Process job card items when data changes
  useEffect(() => {
    if (jobCardItems && jobCardItems.length > 0 && selectedItems.length === 0) {
      const jobCardInvoiceItems: InvoiceItem[] = jobCardItems.map((item: any) => ({
        id: item.id,
        name: item.inventory_items?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.price_per_unit,
        total: item.quantity * item.price_per_unit,
        inventory_item_id: item.inventory_item_id
      }));
      
      setSelectedItems(jobCardInvoiceItems);
    }
  }, [jobCardItems, selectedItems.length]);

  // Job card services query
  const { data: jobCardServices = [] } = useQuery({
    queryKey: ['jobCardServices', selectedJobCardId],
    queryFn: () => getJobCardServices(selectedJobCardId),
    enabled: !!selectedJobCardId
  });

  // Process job card services when data changes
  useEffect(() => {
    if (jobCardServices && jobCardServices.length > 0 && services.length === 0) {
      const jobCardInvoiceServices: InvoiceService[] = jobCardServices.map((service: any) => ({
        id: service.id,
        name: service.service_name,
        hours: service.hours_spent || 1,
        rate: service.rate_per_hour,
        total: (service.hours_spent || 1) * service.rate_per_hour
      }));
      
      setServices(jobCardInvoiceServices);
    }
  }, [jobCardServices, services.length]);

  // Inventory items query
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });

  // All job cards query
  const { data: allJobCards = [] } = useQuery({
    queryKey: ['allJobCards'],
    queryFn: getAllJobCards
  });

  const filteredInventoryItems = inventoryItems.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addInventoryItem = (item: any) => {
    if (selectedItems.some(i => i.inventory_item_id === item.id)) {
      toast.error('This item is already added to the invoice');
      return;
    }

    if (item.quantity <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        name: item.name,
        quantity: 1,
        price: item.price,
        total: item.price,
        inventory_item_id: item.id
      }
    ]);
    
    setSearchTerm('');
    setShowItemSearch(false);
  };

  const addService = () => {
    setServices([
      ...services,
      { 
        name: 'Service',
        hours: 1,
        rate: 500,
        total: 500
      }
    ]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...selectedItems];
    const item = updatedItems[index];
    if (!item) return;

    if (item.inventory_item_id) {
      const inventoryItem = inventoryItems.find((i: any) => i.id === item.inventory_item_id);
      if (inventoryItem && quantity > inventoryItem.quantity) {
        toast.error(`Only ${inventoryItem.quantity} units available in inventory`);
        return;
      }
    }

    updatedItems[index] = {
      ...item,
      quantity,
      total: quantity * item.price
    };
    
    setSelectedItems(updatedItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...selectedItems];
    const item = updatedItems[index];
    if (!item) return;

    updatedItems[index] = {
      ...item,
      price,
      total: item.quantity * price
    };
    
    setSelectedItems(updatedItems);
  };

  const updateService = (index: number, field: keyof InvoiceService, value: number | string) => {
    const updatedServices = [...services];
    const service = updatedServices[index];
    if (!service) return;

    if (field === 'hours' || field === 'rate') {
      const hours = field === 'hours' ? Number(value) : service.hours;
      const rate = field === 'rate' ? Number(value) : service.rate;
      
      updatedServices[index] = {
        ...service,
        [field]: Number(value),
        total: hours * rate
      };
    } else {
      updatedServices[index] = {
        ...service,
        [field]: value
      };
    }
    
    setServices(updatedServices);
  };

  const calculateTotals = () => {
    const itemsTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
    const servicesTotal = services.reduce((sum, service) => sum + service.total, 0);
    const subtotal = itemsTotal + servicesTotal;
    const taxRate = 0.18;
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    return {
      itemsTotal,
      servicesTotal,
      subtotal,
      taxAmount,
      grandTotal
    };
  };

  const { subtotal, taxAmount, grandTotal } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0 && services.length === 0) {
      toast.error('Please add at least one item or service to the invoice');
      return;
    }

    if (!dueDate) {
      toast.error('Please set a due date for the invoice');
      return;
    }

    if (!jobCard && selectedJobCardId) {
      toast.error('Selected job card could not be loaded');
      return;
    }

    setLoading(true);

    try {
      const customer_id = jobCard?.customer_id || '';
      
      if (!customer_id) {
        toast.error('A customer is required for the invoice');
        setLoading(false);
        return;
      }

      const invoiceData = {
        customer_id,
        job_card_id: selectedJobCardId || undefined,
        total_amount: subtotal,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        status: 'unpaid' as const,
        due_date: dueDate.toISOString(),
        services,
        parts: selectedItems,
        notes
      };

      console.log("Creating invoice with data:", invoiceData);
      const result = await createInvoice(invoiceData);
      
      if (result) {
        toast.success('Invoice created successfully');
        if (onSuccess) onSuccess();
      } else {
        toast.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(`Failed to create invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="job-card">Select Job Card (Optional)</Label>
        <Select
          value={selectedJobCardId}
          onValueChange={(value) => {
            setSelectedJobCardId(value);
            // Clear existing items and services when changing job card
            if (value !== selectedJobCardId) {
              setSelectedItems([]);
              setServices([]);
            }
          }}
        >
          <SelectTrigger id="job-card">
            <SelectValue placeholder="Select a job card" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No job card</SelectItem>
            {allJobCards.map((jobCard: any) => (
              <SelectItem key={jobCard.id} value={jobCard.id}>
                #{jobCard.id.substring(0, 8)} - {jobCard.vehicles?.make} {jobCard.vehicles?.model} ({jobCard.customers?.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedJobCardId && jobCard && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Customer</h3>
                  <p>{jobCard.customers?.name}</p>
                  {jobCard.customers?.phone && <p className="text-xs text-muted-foreground">{jobCard.customers.phone}</p>}
                </div>
                <div>
                  <h3 className="text-sm font-medium">Vehicle</h3>
                  <p>{jobCard.vehicles?.make} {jobCard.vehicles?.model}</p>
                  {jobCard.vehicles?.license_plate && <p className="text-xs text-muted-foreground">License: {jobCard.vehicles.license_plate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Due Date</Label>
        </div>
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
              onSelect={(date) => date && setDueDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Parts</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowItemSearch(!showItemSearch)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Part
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showItemSearch && (
            <div className="space-y-2">
              <Input
                type="search"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Card className="overflow-hidden">
                  <div className="max-h-60 overflow-auto">
                    {filteredInventoryItems.length > 0 ? (
                      filteredInventoryItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer border-b last:border-0"
                          onClick={() => addInventoryItem(item)}
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.part_number && `#${item.part_number}`} {item.brand && `• ${item.brand}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.price)}</p>
                            <Badge variant={item.quantity > 0 ? "outline" : "destructive"} className="text-xs">
                              {item.quantity} in stock
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">
                        No items found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {selectedItems.length > 0 ? (
            <div className="space-y-4">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex flex-col space-y-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`item-quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`item-price-${index}`}>Price</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No parts added. Click "Add Part" to add parts from inventory.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Services</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addService}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex flex-col space-y-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Service name"
                      value={service.name}
                      onChange={(e) => updateService(index, 'name', e.target.value)}
                      className="border-0 p-0 text-base font-medium h-7 focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor={`service-hours-${index}`}>Hours</Label>
                      <Input
                        id={`service-hours-${index}`}
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={service.hours}
                        onChange={(e) => updateService(index, 'hours', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`service-rate-${index}`}>Rate/Hour</Label>
                      <Input
                        id={`service-rate-${index}`}
                        type="number"
                        min="0"
                        step="1"
                        value={service.rate}
                        onChange={(e) => updateService(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center">
                        {formatCurrency(service.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No services added. Click "Add Service" to add a service.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional information or comments..."
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="flex items-center">
                <IndianRupee className="h-4 w-4 mr-1" />
                {grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            className="gap-2" 
            disabled={loading || (selectedItems.length === 0 && services.length === 0) || !dueDate}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>Generate Invoice</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
