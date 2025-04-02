
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addJobCardService, removeJobCardService, getJobCardServices } from '@/services/jobCardService';
import { toast } from '@/lib/toast';

interface JobCardServicesFormProps {
  jobCardId: string;
}

export function JobCardServicesForm({ jobCardId }: JobCardServicesFormProps) {
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [hoursSpent, setHoursSpent] = useState(1);
  const [ratePerHour, setRatePerHour] = useState(500); // Default rate
  const queryClient = useQueryClient();

  const { data: jobCardServices = [], isLoading } = useQuery({
    queryKey: ['jobCardServices', jobCardId],
    queryFn: () => getJobCardServices(jobCardId),
    enabled: !!jobCardId
  });

  const addServiceMutation = useMutation({
    mutationFn: (data: any) => addJobCardService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCardServices', jobCardId] });
      toast.success('Service added to job card successfully');
      resetForm();
    },
    onError: (error) => {
      console.error('Error adding service:', error);
      toast.error('Failed to add service to job card');
    }
  });

  const removeServiceMutation = useMutation({
    mutationFn: (serviceId: string) => removeJobCardService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCardServices', jobCardId] });
      toast.success('Service removed from job card');
    },
    onError: (error) => {
      console.error('Error removing service:', error);
      toast.error('Failed to remove service from job card');
    }
  });

  const resetForm = () => {
    setServiceName('');
    setServiceDescription('');
    setHoursSpent(1);
    setRatePerHour(500);
  };

  const handleAddService = () => {
    if (!serviceName) {
      toast.error('Please provide a service name');
      return;
    }

    if (ratePerHour <= 0) {
      toast.error('Rate per hour must be greater than zero');
      return;
    }

    const serviceData = {
      job_card_id: jobCardId,
      service_name: serviceName,
      description: serviceDescription || undefined,
      hours_spent: hoursSpent,
      rate_per_hour: ratePerHour
    };

    addServiceMutation.mutate(serviceData);
  };

  const handleRemoveService = (serviceId: string) => {
    if (removeServiceMutation.isPending) return;
    
    removeServiceMutation.mutate(serviceId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Oil Change, Brake Service, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-description">Description (Optional)</Label>
                <Input
                  id="service-description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Brief description of the service"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours-spent">Hours Spent</Label>
                <Input
                  id="hours-spent"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(parseFloat(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-per-hour">Rate per Hour (₹)</Label>
                <Input
                  id="rate-per-hour"
                  type="number"
                  min={100}
                  value={ratePerHour}
                  onChange={(e) => setRatePerHour(parseFloat(e.target.value) || 500)}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleAddService}
                disabled={addServiceMutation.isPending || !serviceName}
                className="gap-1"
              >
                <Plus className="h-4 w-4" /> Add Service
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Services Added to Job Card</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center">Loading job card services...</div>
          ) : jobCardServices.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              No services added to this job card yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCardServices.map((service: any) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.service_name}</TableCell>
                    <TableCell>{service.description || '—'}</TableCell>
                    <TableCell>{service.hours_spent || 1}</TableCell>
                    <TableCell>₹{service.rate_per_hour}</TableCell>
                    <TableCell>
                      ₹{((service.hours_spent || 1) * service.rate_per_hour).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveService(service.id)}
                        disabled={removeServiceMutation.isPending}
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
