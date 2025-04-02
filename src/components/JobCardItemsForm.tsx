
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Trash, Package, Minus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryItems } from '@/services/inventoryService';
import { addJobCardItem, removeJobCardItem, getJobCardItems } from '@/services/jobCardService';
import { toast } from '@/lib/toast';

interface JobCardItemsFormProps {
  jobCardId: string;
}

export function JobCardItemsForm({ jobCardId }: JobCardItemsFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems
  });

  const { data: jobCardItems = [], isLoading } = useQuery({
    queryKey: ['jobCardItems', jobCardId],
    queryFn: () => getJobCardItems(jobCardId),
    enabled: !!jobCardId
  });

  const addItemMutation = useMutation({
    mutationFn: (data: any) => addJobCardItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCardItems', jobCardId] });
      toast.success('Item added to job card successfully');
      setSelectedItem(null);
      setQuantity(1);
      setSearchTerm('');
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast.error('Failed to add item to job card');
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeJobCardItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCardItems', jobCardId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item removed from job card');
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from job card');
    }
  });

  const filteredInventoryItems = inventoryItems.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectItem = (itemId: string) => {
    const item = inventoryItems.find((i: any) => i.id === itemId);
    if (!item) return;
    
    setSelectedItem(itemId);
    setSearchTerm(item.name);
  };

  const handleAddItem = () => {
    if (!selectedItem) {
      toast.error('Please select an item from inventory');
      return;
    }

    const item = inventoryItems.find((i: any) => i.id === selectedItem);
    if (!item) {
      toast.error('Selected item not found in inventory');
      return;
    }

    if (item.quantity < quantity) {
      toast.error(`Only ${item.quantity} units available in inventory`);
      return;
    }

    const existingItem = jobCardItems.find((i: any) => i.inventory_item_id === selectedItem);
    if (existingItem) {
      toast.error('This item is already added to this job card');
      return;
    }

    const itemData = {
      job_card_id: jobCardId,
      inventory_item_id: selectedItem,
      quantity: quantity,
      price_per_unit: item.price
    };

    addItemMutation.mutate(itemData);
  };

  const handleRemoveItem = (itemId: string) => {
    if (removeItemMutation.isPending) return;
    
    removeItemMutation.mutate(itemId);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory items..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedItem(null);
              }}
            />
            {searchTerm && !selectedItem && (
              <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-md z-50 max-h-60 overflow-auto">
                {filteredInventoryItems.length > 0 ? (
                  filteredInventoryItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleSelectItem(item.id)}
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
          
          <div className="flex items-end gap-2">
            <div className="w-24">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <Button 
              onClick={handleAddItem} 
              disabled={!selectedItem || addItemMutation.isPending}
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Parts Added to Job Card</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center">Loading job card items...</div>
          ) : jobCardItems.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              No parts added to this job card yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCardItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{item.inventory_items?.name || 'Unknown Item'}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.inventory_items?.part_number && `#${item.inventory_items.part_number}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price_per_unit}</TableCell>
                    <TableCell>₹{(item.quantity * item.price_per_unit).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
