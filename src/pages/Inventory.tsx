
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, ShoppingCart, ArrowUpRight, PackageOpen, Package, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  partNumber: string;
  brand: string;
  price: number;
  quantity: number;
  minQuantity: number;
  location: string;
}

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Engine Oil Filter', category: 'Filters', partNumber: 'OF-10123', brand: 'Bosch', price: 580, quantity: 28, minQuantity: 10, location: 'Rack A1' },
  { id: '2', name: 'Front Brake Pads', category: 'Brakes', partNumber: 'BP-22045', brand: 'Brembo', price: 2450, quantity: 12, minQuantity: 8, location: 'Rack B2' },
  { id: '3', name: 'Spark Plugs Set', category: 'Electrical', partNumber: 'SP-35067', brand: 'NGK', price: 890, quantity: 15, minQuantity: 10, location: 'Rack C3' },
  { id: '4', name: 'Air Filter', category: 'Filters', partNumber: 'AF-40012', brand: 'Purolator', price: 450, quantity: 7, minQuantity: 10, location: 'Rack A2' },
  { id: '5', name: 'AC Compressor', category: 'AC System', partNumber: 'AC-55789', brand: 'Denso', price: 12500, quantity: 3, minQuantity: 2, location: 'Rack D1' },
  { id: '6', name: 'Transmission Fluid', category: 'Fluids', partNumber: 'TF-60234', brand: 'Castrol', price: 780, quantity: 18, minQuantity: 5, location: 'Rack E2' },
];

const getStockStatus = (quantity: number, minQuantity: number) => {
  if (quantity === 0) return { badge: 'Out of Stock', color: 'bg-destructive/10 text-destructive' };
  if (quantity < minQuantity) return { badge: 'Low Stock', color: 'bg-warning/10 text-warning' };
  return { badge: 'In Stock', color: 'bg-success/10 text-success' };
};

const getStockPercentage = (quantity: number, minQuantity: number) => {
  if (quantity === 0) return 0;
  if (minQuantity === 0) return 100; // Avoid division by zero
  
  const threshold = minQuantity * 3; // Consider 3x min as "full stock"
  const percentage = (quantity / threshold) * 100;
  return Math.min(percentage, 100); // Cap at 100%
};

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter inventory based on search and tab
  const filteredInventory = inventory.filter(item => {
    // Filter by tab
    if (activeTab === 'low-stock' && item.quantity >= item.minQuantity) return false;
    if (activeTab === 'in-stock' && item.quantity < item.minQuantity) return false;
    
    // Filter by search term
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Calculate inventory statistics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity < item.minQuantity).length;
  const inventoryValue = inventory.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
            <p className="text-muted-foreground">Manage your parts and supplies</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddItemOpen(true)}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalItems}</div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PackageOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{lowStockItems}</div>
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₹{inventoryValue.toLocaleString('en-IN')}</div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search parts by name, number, brand..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map(item => {
                    const stockStatus = getStockStatus(item.quantity, item.minQuantity);
                    const stockPercentage = getStockPercentage(item.quantity, item.minQuantity);
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-smooth">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.partNumber}</span>
                              <span>•</span>
                              <span>{item.brand}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.category}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 max-w-[150px]">
                            <div className="flex items-center justify-between">
                              <Badge className={stockStatus.color}>
                                {stockStatus.badge}
                              </Badge>
                              <span className="text-sm">{item.quantity} pcs</span>
                            </div>
                            <Progress
                              value={stockPercentage}
                              className={`h-2 ${
                                item.quantity === 0 ? 'bg-destructive/20' :
                                item.quantity < item.minQuantity ? 'bg-warning/20' : 'bg-success/20'
                              }`}
                              indicatorClassName={
                                item.quantity === 0 ? 'bg-destructive' :
                                item.quantity < item.minQuantity ? 'bg-warning' : 'bg-success'
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {item.location}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{item.price.toLocaleString('en-IN')}
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
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Edit item</DropdownMenuItem>
                              <DropdownMenuItem>Add stock</DropdownMenuItem>
                              <DropdownMenuItem>Remove stock</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new part or supply to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input id="item-name" placeholder="e.g. Engine Oil Filter" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filters">Filters</SelectItem>
                    <SelectItem value="brakes">Brakes</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="fluids">Fluids</SelectItem>
                    <SelectItem value="engine">Engine Parts</SelectItem>
                    <SelectItem value="ac">AC System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="part-number">Part Number</Label>
                <Input id="part-number" placeholder="e.g. OF-10123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="e.g. Bosch" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input id="location" placeholder="e.g. Rack A1" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input id="quantity" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-quantity">Minimum Quantity</Label>
                <Input id="min-quantity" type="number" placeholder="0" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input id="notes" placeholder="Any additional details about this item" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddItemOpen(false)}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Inventory;
