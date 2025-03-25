
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { IndianRupee, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceItem {
  id: string;
  name: string;
  cost: number;
}

interface PartItem {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

interface AutoBillGeneratorProps {
  jobCardId?: string;
  initialServices?: ServiceItem[];
  initialParts?: PartItem[];
  onGenerateBill?: (data: {
    services: ServiceItem[];
    parts: PartItem[];
    total: number;
    notes: string;
  }) => void;
}

export function AutoBillGenerator({
  jobCardId,
  initialServices = [],
  initialParts = [],
  onGenerateBill
}: AutoBillGeneratorProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [parts, setParts] = useState<PartItem[]>(initialParts);
  const [newService, setNewService] = useState({ name: '', cost: 0 });
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, cost: 0 });
  const [notes, setNotes] = useState('');
  
  const generateRandomId = () => Math.random().toString(36).substring(2, 9);
  
  const handleAddService = () => {
    if (newService.name && newService.cost > 0) {
      setServices([...services, { ...newService, id: generateRandomId() }]);
      setNewService({ name: '', cost: 0 });
    }
  };
  
  const handleAddPart = () => {
    if (newPart.name && newPart.quantity > 0 && newPart.cost > 0) {
      setParts([...parts, { ...newPart, id: generateRandomId() }]);
      setNewPart({ name: '', quantity: 1, cost: 0 });
    }
  };
  
  const handleRemoveService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };
  
  const handleRemovePart = (id: string) => {
    setParts(parts.filter(part => part.id !== id));
  };
  
  const calculateTotals = () => {
    const serviceTotal = services.reduce((sum, service) => sum + service.cost, 0);
    const partsTotal = parts.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
    const grandTotal = serviceTotal + partsTotal;
    
    return {
      services: serviceTotal,
      parts: partsTotal,
      total: grandTotal
    };
  };
  
  const handleGenerate = () => {
    if (onGenerateBill) {
      onGenerateBill({
        services,
        parts,
        total: calculateTotals().total,
        notes
      });
    }
  };
  
  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {jobCardId && (
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Auto-generating bill for:</p>
            <p className="font-medium">Job Card #{jobCardId}</p>
          </div>
          <Badge variant="outline" className="ml-auto">Auto Bill</Badge>
        </div>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Service name" 
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="flex-1"
              />
              <div className="flex items-center">
                <span className="mr-1">₹</span>
                <Input 
                  type="number" 
                  placeholder="Cost" 
                  value={newService.cost || ''}
                  onChange={(e) => setNewService({ ...newService, cost: Number(e.target.value) })}
                  className="w-24"
                />
              </div>
              <Button onClick={handleAddService} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            {services.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell className="text-right">{service.cost.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium">Services Subtotal</TableCell>
                    <TableCell className="text-right font-medium">{totals.services.toLocaleString('en-IN')}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No services added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Part name" 
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                className="flex-1"
              />
              <Input 
                type="number" 
                placeholder="Qty" 
                value={newPart.quantity || ''}
                onChange={(e) => setNewPart({ ...newPart, quantity: Number(e.target.value) })}
                className="w-16"
                min="1"
              />
              <div className="flex items-center">
                <span className="mr-1">₹</span>
                <Input 
                  type="number" 
                  placeholder="Cost" 
                  value={newPart.cost || ''}
                  onChange={(e) => setNewPart({ ...newPart, cost: Number(e.target.value) })}
                  className="w-24"
                />
              </div>
              <Button onClick={handleAddPart} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            {parts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price (₹)</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell>{part.name}</TableCell>
                      <TableCell>{part.quantity}</TableCell>
                      <TableCell>{part.cost.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">{(part.cost * part.quantity).toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemovePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium" colSpan={3}>Parts Subtotal</TableCell>
                    <TableCell className="text-right font-medium">{totals.parts.toLocaleString('en-IN')}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No parts added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Additional Notes</label>
        <Input
          placeholder="Add any special notes or payment terms"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" />
            {totals.total.toLocaleString('en-IN')}
          </p>
        </div>
        
        <Button onClick={handleGenerate} className="gap-1" size="lg">
          <IndianRupee className="h-4 w-4" /> Generate Bill
        </Button>
      </div>
    </div>
  );
}
