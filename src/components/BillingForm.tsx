
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash, Package, IndianRupee, ListCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '@/services/inventoryService';
import { getJobCardById, getJobCardServices, getJobCardItems } from '@/services/jobCardService';
import { createInvoice } from '@/services/billing';
import { toast } from '@/lib/toast';
import { Invoice, InvoiceItem, InvoiceService } from '@/services/billing/types';
import { getAllJobCards } from '@/services/jobCardService';

interface BillingFormProps {
  jobCardId?: string;
  onSuccess?: () => void;
}

export function BillingForm({ jobCardId: initialJobCardId, onSuccess }: BillingFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [services, setServices] = useState<InvoiceService[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedJobCardId, setSelectedJobCardId] = useState(initialJobCardId || '');

  const { data: jobCard } = useQuery({
    queryKey: ['jobCard', selectedJobCardId],
    queryFn: () => getJobCardById(selectedJobCardId),
    enabled: !!selectedJobCardId
  });

  const { data: jobCardItems = [] } = useQuery({
    queryKey: ['jobCardItems', selectedJobCardId],
    queryFn: () => getJobCardItems(selectedJobCardId),
    enabled: !!selectedJobCardId
  });

  // Process jobCardItems when data changes
  useEffect(() => {
    if (jobCardItems && jobCardItems.length > 0 && selectedItems.length === 0) {
      const jobCardInvoiceItems: InvoiceItem[] = jobCardItems.map((item: any) => ({
        name: item.inventory_items?.name || 'Unknown Item',
        quantity: item.quantity,
        cost: item.price_per_unit,
        inventory_item_id: item.inventory_item_id
      }));
      
      setSelectedItems(jobCardInvoiceItems);
    }
  }, [jobCardItems, selectedItems.length]);

  const { data: jobCardServices = [] } = useQuery({
    queryKey: ['jobCardServices', selectedJobCardId],
    queryFn: () => getJobCardServices(selectedJobCardId),
    enabled: !!selectedJobCardId
  });

  // Process jobCardServices when data changes
  useEffect(() => {
    if (jobCardServices && jobCardServices.length > 0 && services.length === 0) {
      const jobCardInvoiceServices: InvoiceService[] = jobCardServices.map((service: any) => ({
        name: service.service_name,
        description: service.description,
        cost: service.rate_per_hour * (service.hours_spent || 1)
      }));
      
      setServices(jobCardInvoiceServices);
    }
  }, [jobCardServices, services.length]);

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });

  const { data: allJobCards = [] } = useQuery({
    queryKey: ['allJobCards'],
    queryFn: getAllJobCards
  });

  const filteredInventoryItems = inventoryItems.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addInventoryItem = (itemId: string) => {
    const item = inventoryItems.find((i: any) => i.id === itemId);
    if (!item) return;

    if (selectedItems.some(i => i.inventory_item_id === itemId)) {
      toast.error('This item is already added to the bill');
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
        cost: item.price,
        inventory_item_id: item.id
      }
    ]);
    setSearchTerm('');
  };

  const addService = () => {
    setServices([
      ...services,
      { 
        name: 'Service',
        description: '',
        cost: 0
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
    const item = selectedItems[index];
    if (!item) return;

    if (item.inventory_item_id) {
      const inventoryItem = inventoryItems.find((i: any) => i.id === item.inventory_item_id);
      if (inventoryItem && quantity > inventoryItem.quantity) {
        toast.error(`Only ${inventoryItem.quantity} units available in inventory`);
        return;
      }
    }

    setSelectedItems(
      selectedItems.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    );
  };

  const updateService = (index: number, field: 'name' | 'description' | 'cost', value: string | number) => {
    setServices(
      services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    );
  };

  const calculateTotals = () => {
    const itemsTotal = selectedItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    const servicesTotal = services.reduce((sum, service) => sum + (service.cost || 0), 0);
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
      toast.error('Please add at least one item or service to the bill');
      return;
    }

    setLoading(true);

    try {
      const invoiceStatus: 'pending' | 'paid' | 'overdue' = 'pending';

      const invoiceData = {
        customer_id: jobCard?.customer_id || '',
        job_card_id: selectedJobCardId || undefined,
        total_amount: subtotal,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        status: invoiceStatus,
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
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
        toast.error('Failed to create invoice - no result returned');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(`Failed to create invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!initialJobCardId && (
        <div className="space-y-2">
          <Label htmlFor="job-card">Select Job Card (Optional)</Label>
          <Select
            value={selectedJobCardId}
            onValueChange={setSelectedJobCardId}
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
          {selectedJobCardId && (
            <p className="text-sm text-muted-foreground">
              Items and services from this job card will be automatically added to the bill.
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Parts from Inventory</h3>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-md z-50 max-h-60 overflow-auto">
                  {filteredInventoryItems.length > 0 ? (
                    filteredInventoryItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                        onClick={() => addInventoryItem(item.id)}
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.part_number && `#${item.part_number}`} {item.brand && `• ${item.brand}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} in stock</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">No items found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedItems.length > 0 ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-4">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₹{item.cost} per unit</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`quantity-${index}`} className="sr-only">Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          className="w-16"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-24 text-right font-medium">
                        ₹{(item.cost * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No parts added yet. Search and select parts from inventory.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Services</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addService}
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        </div>

        {services.length > 0 ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="grid gap-4 py-2 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <Label htmlFor={`service-name-${index}`}>Service Name</Label>
                        <Input
                          id={`service-name-${index}`}
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-32 mr-4">
                        <Label htmlFor={`service-cost-${index}`}>Cost (₹)</Label>
                        <Input
                          id={`service-cost-${index}`}
                          type="number"
                          min="0"
                          value={service.cost}
                          onChange={(e) => updateService(index, 'cost', Number(e.target.value))}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeService(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`service-desc-${index}`}>Description (Optional)</Label>
                      <Input
                        id={`service-desc-${index}`}
                        value={service.description || ''}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No services added yet. Click "Add Service" to add one.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional information or comments..."
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Bill Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-medium">₹{taxAmount.toLocaleString('en-IN')}</span>
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
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="gap-2" 
          disabled={loading || (selectedItems.length === 0 && services.length === 0)}
        >
          {loading ? 'Creating Invoice...' : 'Generate Invoice'}
        </Button>
      </div>
    </form>
  );
}
