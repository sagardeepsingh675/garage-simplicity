
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, MoreHorizontal, User, Phone, Mail, MapPin, Car } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  vehicles: number;
  lastVisit: string;
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@example.com', address: 'Mumbai, Maharashtra', vehicles: 2, lastVisit: '2023-07-15' },
  { id: '2', name: 'Priya Singh', phone: '+91 87654 32109', email: 'priya@example.com', address: 'Delhi, Delhi', vehicles: 1, lastVisit: '2023-08-22' },
  { id: '3', name: 'Amit Patel', phone: '+91 76543 21098', email: 'amit@example.com', address: 'Ahmedabad, Gujarat', vehicles: 3, lastVisit: '2023-09-05' },
  { id: '4', name: 'Sunita Sharma', phone: '+91 65432 10987', email: 'sunita@example.com', address: 'Jaipur, Rajasthan', vehicles: 1, lastVisit: '2023-06-30' },
  { id: '5', name: 'Vikram Mehta', phone: '+91 54321 09876', email: 'vikram@example.com', address: 'Bangalore, Karnataka', vehicles: 2, lastVisit: '2023-08-10' },
];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">Manage your customer records</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddCustomerOpen(true)}>
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Address</TableHead>
                  <TableHead className="hidden sm:table-cell">Vehicles</TableHead>
                  <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(customer => (
                    <TableRow key={customer.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden sm:flex h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {customer.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" /> {customer.phone}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" /> {customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {customer.address}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.vehicles}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(customer.lastVisit).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
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
                            <DropdownMenuItem>Edit customer</DropdownMenuItem>
                            <DropdownMenuItem>Add vehicle</DropdownMenuItem>
                            <DropdownMenuItem>Create job card</DropdownMenuItem>
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
      
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer details below to create a new record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input id="address" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddCustomerOpen(false)}>
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Customers;
