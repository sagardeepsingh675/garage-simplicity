
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Wrench, Car, User, Calendar, FileText } from 'lucide-react';
import { getJobCardById } from '@/services/jobCardService';
import { JobCardItemsForm } from '@/components/JobCardItemsForm';
import { JobCardServicesForm } from '@/components/JobCardServicesForm';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-muted text-muted-foreground';
    case 'in-progress':
      return 'bg-warning/10 text-warning';
    case 'completed':
      return 'bg-success/10 text-success';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function JobCardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: jobCard, isLoading, error } = useQuery({
    queryKey: ['jobCard', id],
    queryFn: () => getJobCardById(id || ''),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading job card details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !jobCard) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Job card not found or error loading details.</p>
          <Button variant="outline" onClick={() => navigate('/job-cards')}>
            Back to Job Cards
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => navigate('/job-cards')} className="flex items-center gap-1 px-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Job Cards</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Job Card #{id?.substring(0, 8).toUpperCase()}</h1>
              <Badge className={getStatusColor(jobCard.status)}>
                {jobCard.status === 'in-progress' ? 'In Progress' : 
                jobCard.status.charAt(0).toUpperCase() + jobCard.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">Created on {new Date(jobCard.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Vehicle Information</CardTitle>
                    <Car className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobCard.vehicles ? (
                    <div className="space-y-2">
                      <p className="font-medium">
                        {jobCard.vehicles.make} {jobCard.vehicles.model} ({jobCard.vehicles.year || 'N/A'})
                      </p>
                      <p className="text-sm">License Plate: {jobCard.vehicles.license_plate || 'N/A'}</p>
                      <p className="text-sm">Color: {jobCard.vehicles.color || 'N/A'}</p>
                      <p className="text-sm">VIN: {jobCard.vehicles.vin || 'N/A'}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Vehicle information not available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobCard.customers ? (
                    <div className="space-y-2">
                      <p className="font-medium">{jobCard.customers.name}</p>
                      <p className="text-sm">Phone: {jobCard.customers.phone || 'N/A'}</p>
                      <p className="text-sm">Email: {jobCard.customers.email || 'N/A'}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Customer information not available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Service Information</CardTitle>
                    <Wrench className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(jobCard.status)}>
                        {jobCard.status === 'in-progress' ? 'In Progress' : 
                         jobCard.status.charAt(0).toUpperCase() + jobCard.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issue</p>
                      <p>{jobCard.issue_description}</p>
                    </div>
                    {jobCard.diagnosis && (
                      <div>
                        <p className="text-sm text-muted-foreground">Diagnosis</p>
                        <p>{jobCard.diagnosis}</p>
                      </div>
                    )}
                    {jobCard.staff && (
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned To</p>
                        <p>{jobCard.staff.name}</p>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm">
                          Created: {new Date(jobCard.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {jobCard.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm">
                            Started: {new Date(jobCard.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {jobCard.completion_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm">
                            Completed: {new Date(jobCard.completion_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="parts" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Parts Used</CardTitle>
                <CardDescription>
                  Add parts from inventory for this job card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobCardItemsForm jobCardId={id || ''} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Services Performed</CardTitle>
                <CardDescription>
                  Add services performed for this job card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobCardServicesForm jobCardId={id || ''} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
