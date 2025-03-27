import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash, Package, IndianRupee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '@/services/inventoryService';
import { getJobCardById } from '@/services/jobCardService';
import { createInvoice } from '@/services/billing';
import { toast } from '@/lib/toast';
import { Invoice } from '@/services/billing/types';

interface BillingFormProps {
  jobCardId: string;
  onSuccess?: () => void;
}

export function BillingForm({ jobCardId, onSuccess }: BillingFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    inventoryId: string;
  }>>([]);
  const [services, setServices] = useState<Array<{
    name: string;
    description?: string;
    cost: number;
  }>>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch inventory items
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });

  // Fetch job card details
  const { data: jobCard, isLoading: isJobCardLoading } = useQuery({
    queryKey: ['jobCard', jobCardId],
    queryFn: () => getJobCardById(jobCardId),
    enabled: !!jobCardId
  });

  // Filter inventory items based on search term
  const filteredInventoryItems = inventoryItems.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add inventory item to the bill
  const addInventoryItem = (itemId: string) => {
    const item = inventoryItems.find((i: any) => i.id === itemId);
    if (!item) return;

    // Check if already added
    if (selectedItems.some(i => i.inventoryId === itemId)) {
      toast.error('This item is already added to the bill');
      return;
    }

    // Check inventory quantity
    if (item.quantity <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: item.name,
        quantity: 1,
        price: item.price,
        inventoryId: item.id
      }
    ]);
    setSearchTerm('');
  };

  // Add service to the bill
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

  // Remove item from the bill
  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  // Remove service from the bill
  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Update item quantity
  const updateItemQuantity = (id: string, quantity: number) => {
    const item = selectedItems.find(i => i.id === id);
    if (!item) return;

    const inventoryItem = inventoryItems.find((i: any) => i.id === item.inventoryId);
    if (!inventoryItem) return;

    // Validate against inventory quantity
    if (quantity > inventoryItem.quantity) {
      toast.error(`Only ${inventoryItem.quantity} units available in inventory`);
      return;
    }

    setSelectedItems(
      selectedItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Update service details
  const updateService = (index: number, field: 'name' | 'description' | 'cost', value: string | number) => {
    setServices(
      services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    const itemsTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const servicesTotal = services.reduce((sum, service) => sum + (service.cost || 0), 0);
    const subtotal = itemsTotal + servicesTotal;
    const taxRate = 0.18; // 18% GST
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobCard) {
      toast.error('Job card information missing');
      return;
    }

    if (selectedItems.length === 0 && services.length === 0) {
      toast.error('Please add at least one item or service to the bill');
      return;
    }

    setLoading(true);

    try {
      // Convert selected items to billing format
      const parts = selectedItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        cost: item.price,
        inventory_item_id: item.inventoryId
      }));

      const invoiceData = {
        customer_id: jobCard.customer_id,
        vehicle_id: jobCard.vehicle_id,
        job_card_id: jobCard.id,
        total_amount: subtotal,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        status: 'pending' as 'pending' | 'paid' | 'overdue',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        services,
        parts,
        notes
      };

      const result = await createInvoice(invoiceData);
      
      if (result) {
        toast.success('Invoice created successfully');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  if (isJobCardLoading) {
    return <div>Loading job card information...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-4">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price} per unit</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          className="w-16"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-24 text-right font-medium">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
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
          disabled={loading || selectedItems.length === 0 && services.length === 0}
        >
          {loading ? 'Creating Invoice...' : 'Generate Invoice'}
        </Button>
      </div>
    </form>
  );
}
