
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Minus } from 'lucide-react';
import { getInventoryItems, InventoryItem } from '@/services/inventoryService';
import { toast } from "@/lib/toast";

interface InventoryItemSelectorProps {
  onItemsSelected: (items: SelectedInventoryItem[]) => void;
  initialItems?: SelectedInventoryItem[];
}

export interface SelectedInventoryItem {
  id: string;
  name: string;
  part_number?: string;
  brand?: string;
  price: number;
  quantity: number;
}

export const InventoryItemSelector: React.FC<InventoryItemSelectorProps> = ({ onItemsSelected, initialItems = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedInventoryItem[]>(initialItems);
  
  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: getInventoryItems
  });
  
  useEffect(() => {
    // Update parent component when selected items change
    onItemsSelected(selectedItems);
  }, [selectedItems, onItemsSelected]);
  
  const filteredItems = inventoryItems.filter((item: InventoryItem) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAddItem = (item: InventoryItem) => {
    const existingItem = selectedItems.find(i => i.id === item.id);
    
    // Check if we have enough quantity in inventory
    if (item.quantity <= 0) {
      toast.error(`${item.name} is out of stock`);
      return;
    }
    
    if (existingItem) {
      // Check if we have enough quantity to add one more
      if (existingItem.quantity >= item.quantity) {
        toast.error(`Not enough ${item.name} in stock. Only ${item.quantity} available.`);
        return;
      }
      
      setSelectedItems(prev => 
        prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        )
      );
    } else {
      setSelectedItems(prev => [...prev, {
        id: item.id,
        name: item.name,
        part_number: item.part_number,
        brand: item.brand,
        price: item.price,
        quantity: 1
      }]);
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    const existingItem = selectedItems.find(i => i.id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setSelectedItems(prev => 
        prev.map(i => 
          i.id === itemId 
            ? { ...i, quantity: i.quantity - 1 } 
            : i
        )
      );
    } else {
      setSelectedItems(prev => prev.filter(i => i.id !== itemId));
    }
  };
  
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const inventoryItem = inventoryItems.find((i: InventoryItem) => i.id === itemId);
    
    if (!inventoryItem) {
      toast.error('Item not found in inventory');
      return;
    }
    
    if (newQuantity > inventoryItem.quantity) {
      toast.error(`Not enough ${inventoryItem.name} in stock. Only ${inventoryItem.quantity} available.`);
      return;
    }
    
    if (newQuantity <= 0) {
      setSelectedItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      setSelectedItems(prev => 
        prev.map(i => 
          i.id === itemId 
            ? { ...i, quantity: newQuantity } 
            : i
        )
      );
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Selected Items</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItems.length === 0 ? (
              <p className="text-center text-muted-foreground">No items selected</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.part_number && `Part #: ${item.part_number}`}
                          {item.brand && ` | ${item.brand}`}
                        </div>
                      </TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-7 text-center"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => {
                              const inventoryItem = inventoryItems.find((i: InventoryItem) => i.id === item.id);
                              if (inventoryItem && item.quantity < inventoryItem.quantity) {
                                handleUpdateQuantity(item.id, item.quantity + 1);
                              } else {
                                toast.error(`Not enough ${item.name} in stock`);
                              }
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Available Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-4">Loading inventory items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center p-4">No items match your search</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item: InventoryItem) => (
                    <TableRow key={item.id} className={item.quantity <= 0 ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.part_number && `Part #: ${item.part_number}`}
                          {item.brand && ` | ${item.brand}`}
                        </div>
                      </TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell className={item.quantity <= item.min_quantity ? "text-amber-600" : ""}>
                        {item.quantity}
                      </TableCell>
                      <TableCell>
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={() => handleAddItem(item)}
                          disabled={item.quantity <= 0}
                        >
                          Add
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
    </div>
  );
};
