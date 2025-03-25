import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, User, CalendarIcon, Info, Car } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { VehicleCanvas } from '@/components/VehicleCanvas';
import { getVehicles, createVehicle, Vehicle } from '@/services/vehicleService';
import { getCustomers } from '@/services/customerService';
import { toast } from '@/lib/toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success hover:bg-success/20';
    case 'servicing':
      return 'bg-warning/10 text-warning hover:bg-warning/20';
    case 'completed':
      return 'bg-info/10 text-info hover:bg-info/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'sedan' | 'suv' | 'hatchback' | 'truck'>('sedan');
  const [newVehicle, setNewVehicle] = useState({
    customer_id: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    vin: '',
    color: ''
  });
  
  const queryClient = useQueryClient();

  // Fetch vehicles
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });
  
  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsAddVehicleOpen(false);
      resetForm();
      toast.success('Vehicle created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create vehicle');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.make || !newVehicle.model || !newVehicle.customer_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Convert year to number
    const vehicle = {
      ...newVehicle,
      year: Number(newVehicle.year)
    };
    
    createVehicleMutation.mutate(vehicle);
  };

  const resetForm = () => {
    setNewVehicle({
      customer_id: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      vin: '',
      color: ''
    });
    setSelectedType('sedan');
  };
  
  const filteredVehicles = vehicles.filter((vehicle: any) => 
    (vehicle.license_plate && vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.customers && vehicle.customers.name && vehicle.customers.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
            <p className="text-muted-foreground">Manage your vehicle records</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddVehicleOpen(true)}>
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by reg. number, make, model..."
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
                  <TableHead>Registration</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Loading vehicles...
                    </TableCell>
                  </TableRow>
                ) : filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">
                        <Link to={`/vehicles/${vehicle.id}`} className="text-primary hover:underline">
                          {vehicle.license_plate || 'No Plate'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{vehicle.make} {vehicle.model}</span>
                          <span className="text-sm text-muted-foreground">{vehicle.year || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{vehicle.customers ? vehicle.customers.name : 'No Owner'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{new Date(vehicle.updated_at).toLocaleDateString()}</span>
                        </div>
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
                            <DropdownMenuItem asChild>
                              <Link to={`/vehicles/${vehicle.id}`}>View details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit vehicle</DropdownMenuItem>
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
      
      <Dialog open={isAddVehicleOpen} onOpenChange={(open) => {
        setIsAddVehicleOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the vehicle details and mark any existing damage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_plate">Registration Number</Label>
                  <Input 
                    id="license_plate" 
                    placeholder="e.g. MH02AB1234" 
                    value={newVehicle.license_plate}
                    onChange={(e) => setNewVehicle({...newVehicle, license_plate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Select 
                    value={newVehicle.customer_id}
                    onValueChange={(value) => setNewVehicle({...newVehicle, customer_id: value})}
                  >
                    <SelectTrigger id="owner">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input 
                    id="make" 
                    placeholder="e.g. Honda" 
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input 
                    id="model" 
                    placeholder="e.g. City" 
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input 
                    id="year" 
                    type="number" 
                    placeholder="e.g. 2022" 
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value) || new Date().getFullYear()})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input 
                    id="color" 
                    placeholder="e.g. Red" 
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vin">VIN Number</Label>
                <Input 
                  id="vin" 
                  placeholder="Vehicle Identification Number" 
                  value={newVehicle.vin}
                  onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                />
              </div>
              
              <div className="pt-2">
                <Label>Vehicle Condition</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Mark any existing dents, scratches or damage on the vehicle diagram
                </p>
                <VehicleCanvas vehicleType={selectedType} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddVehicleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createVehicleMutation.isPending}>
                {createVehicleMutation.isPending ? 'Saving...' : 'Save Vehicle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default Vehicles;
