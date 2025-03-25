
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, User, CalendarIcon, Info, Car } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { VehicleCanvas } from '@/components/VehicleCanvas';

interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: 'sedan' | 'suv' | 'hatchback' | 'truck';
  owner: string;
  lastService: string;
  status: 'active' | 'servicing' | 'completed';
}

const mockVehicles: Vehicle[] = [
  { id: '1', registrationNumber: 'MH02AB1234', make: 'Honda', model: 'City', year: 2020, type: 'sedan', owner: 'Rajesh Kumar', lastService: '2023-07-15', status: 'active' },
  { id: '2', registrationNumber: 'DL01CD5678', make: 'Hyundai', model: 'Creta', year: 2021, type: 'suv', owner: 'Priya Singh', lastService: '2023-08-22', status: 'servicing' },
  { id: '3', registrationNumber: 'GJ05EF9012', make: 'Maruti', model: 'Swift', year: 2019, type: 'hatchback', owner: 'Amit Patel', lastService: '2023-09-05', status: 'completed' },
  { id: '4', registrationNumber: 'RJ06GH3456', make: 'Tata', model: 'Nexon', year: 2022, type: 'suv', owner: 'Sunita Sharma', lastService: '2023-06-30', status: 'active' },
  { id: '5', registrationNumber: 'KA03IJ7890', make: 'Toyota', model: 'Innova', year: 2020, type: 'suv', owner: 'Vikram Mehta', lastService: '2023-08-10', status: 'active' },
];

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
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'sedan' | 'suv' | 'hatchback' | 'truck'>('sedan');
  
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <TableHead className="hidden lg:table-cell">Last Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map(vehicle => (
                    <TableRow key={vehicle.id} className="hover:bg-muted/30 transition-smooth">
                      <TableCell className="font-medium">
                        <Link to={`/vehicles/${vehicle.id}`} className="text-primary hover:underline">
                          {vehicle.registrationNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{vehicle.make} {vehicle.model}</span>
                          <span className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{vehicle.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{new Date(vehicle.lastService).toLocaleDateString('en-IN')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(vehicle.status)}`}>
                          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
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
                            <DropdownMenuItem asChild>
                              <Link to={`/vehicles/${vehicle.id}`}>View details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit vehicle</DropdownMenuItem>
                            <DropdownMenuItem>Create job card</DropdownMenuItem>
                            <DropdownMenuItem>Service history</DropdownMenuItem>
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
      
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the vehicle details and mark any existing damage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg">Registration Number</Label>
                <Input id="reg" placeholder="e.g. MH02AB1234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Select>
                  <SelectTrigger id="owner">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Rajesh Kumar</SelectItem>
                    <SelectItem value="2">Priya Singh</SelectItem>
                    <SelectItem value="3">Amit Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input id="make" placeholder="e.g. Honda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="e.g. City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" placeholder="e.g. 2022" />
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
                <Input id="color" placeholder="e.g. Red" />
              </div>
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
            <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddVehicleOpen(false)}>
              Save Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Vehicles;
