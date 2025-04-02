
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast";
import { VehicleCanvas } from './VehicleCanvas';
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBusinessSettings, BusinessSettings } from '@/services/businessSettingsService';
import { getJobCardById, getJobCardsByVehicleId, getJobCardItems, getJobCardServices } from '@/services/jobCardService';
import { InventoryItemSelector, SelectedInventoryItem } from './InventoryItemSelector';

// Define the props for the AutoBillGenerator component
interface AutoBillGeneratorProps {
  vehicleData: any;
  customerData?: any;
  onGenerateBill: (billData: any) => void;
}

// AutoBillGenerator component
export const AutoBillGenerator: React.FC<AutoBillGeneratorProps> = ({ vehicleData, customerData, onGenerateBill }) => {
  const [subtotal, setSubtotal] = useState(0);
  const [services, setServices] = useState([{ name: '', hours: 1, rate: 0 }]);
  const [notes, setNotes] = useState('');
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(0);
  const [damageImageUrl, setDamageImageUrl] = useState<string | null>(null);
  const [selectedJobCard, setSelectedJobCard] = useState<any>(null);
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<SelectedInventoryItem[]>([]);
  const [jobCardItems, setJobCardItems] = useState<any[]>([]);
  const [jobCardServices, setJobCardServices] = useState<any[]>([]);
  const [isLoadingJobCardData, setIsLoadingJobCardData] = useState(false);
  
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const businessSettings = await getBusinessSettings() as BusinessSettings;
        if (businessSettings) {
          setIsGstEnabled(businessSettings.show_gst_on_invoice || false);
          setGstPercentage(businessSettings.gst_percentage || 0);
        }
      } catch (error) {
        console.error('Error fetching business settings:', error);
        toast.error('Failed to load business settings');
      }
    };
    
    fetchBusinessSettings();
  }, []);
  
  useEffect(() => {
    const fetchJobCards = async () => {
      if (vehicleData?.id) {
        try {
          const jobCardsData = await getJobCardsByVehicleId(vehicleData.id);
          setJobCards(jobCardsData);
        } catch (error) {
          console.error('Error fetching job cards:', error);
          toast.error('Failed to load job cards');
        }
      }
    };
    
    fetchJobCards();
  }, [vehicleData?.id]);

  useEffect(() => {
    const fetchJobCardDetails = async () => {
      if (selectedJobCard?.id) {
        setIsLoadingJobCardData(true);
        try {
          // Get parts used in this job card
          const items = await getJobCardItems(selectedJobCard.id);
          setJobCardItems(items);
          
          // Get services performed in this job card
          const services = await getJobCardServices(selectedJobCard.id);
          setJobCardServices(services);
          
          // Map job card items to inventory items format
          const mappedItems = items.map((item: any) => ({
            id: item.inventory_item_id,
            name: item.inventory_items?.name || 'Unknown Item',
            part_number: item.inventory_items?.part_number,
            brand: item.inventory_items?.brand,
            price: item.price_per_unit,
            quantity: item.quantity
          }));
          setInventoryItems(mappedItems);
          
          // Map job card services to services format
          const mappedServices = services.map((service: any) => ({
            name: service.service_name,
            hours: service.hours_spent || 1,
            rate: service.rate_per_hour
          }));
          setServices(mappedServices.length > 0 ? mappedServices : [{ name: '', hours: 1, rate: 0 }]);
        } catch (error) {
          console.error('Error fetching job card details:', error);
          toast.error('Failed to load job card details');
        } finally {
          setIsLoadingJobCardData(false);
        }
      }
    };
    
    fetchJobCardDetails();
  }, [selectedJobCard]);

  useEffect(() => {
    const partsTotal = inventoryItems.reduce((acc, part) => acc + (part.quantity * part.price), 0);
    const servicesTotal = services.reduce((acc, service) => acc + (service.hours * service.rate), 0);
    setSubtotal(partsTotal + servicesTotal);
  }, [inventoryItems, services]);

  const addService = () => setServices([...services, { name: '', hours: 1, rate: 0 }]);
  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };
  const removeService = (index: number) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    setServices(newServices);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taxAmount = isGstEnabled ? subtotal * (gstPercentage / 100) : 0;
    const totalAmount = subtotal + taxAmount;
    
    onGenerateBill({
      subtotal,
      taxAmount,
      total: totalAmount,
      parts: inventoryItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      services: services.map(service => ({
        name: service.name,
        hours: service.hours,
        rate: service.rate,
        total: service.hours * service.rate
      })),
      notes,
      jobCardId: selectedJobCard?.id,
      vehicleDamageImage: damageImageUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Job Card Selection</CardTitle>
          <CardDescription>Select a job card to generate the bill from</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => {
            const selectedCard = jobCards.find(jobCard => jobCard.id === value);
            setSelectedJobCard(selectedCard);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a job card" />
            </SelectTrigger>
            <SelectContent>
              {jobCards.map((jobCard: any) => (
                <SelectItem key={jobCard.id} value={jobCard.id}>
                  {jobCard.issue_description} - {new Date(jobCard.created_at).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isLoadingJobCardData && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Loading job card details...
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Add parts used for the service</CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryItemSelector 
            onItemsSelected={setInventoryItems} 
            initialItems={inventoryItems}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Add services provided</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {services.map((service, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center">
              <Input
                type="text"
                placeholder="Service Name"
                value={service.name}
                onChange={(e) => updateService(index, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Hours"
                value={service.hours}
                onChange={(e) => updateService(index, 'hours', Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Rate"
                value={service.rate}
                onChange={(e) => updateService(index, 'rate', Number(e.target.value))}
              />
              <Button type="button" variant="destructive" size="sm" onClick={() => removeService(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addService}>
            Add Service
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Condition</CardTitle>
          <CardDescription>Mark any damage to the vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleCanvas vehicleType="sedan" onSave={setDamageImageUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Add any additional notes</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>GST Settings</CardTitle>
          <CardDescription>Enable or disable GST</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="enable-gst">Enable GST</Label>
          <Switch id="enable-gst" checked={isGstEnabled} onCheckedChange={setIsGstEnabled} />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <p className="text-xl">Subtotal: ₹{subtotal.toFixed(2)}</p>
        <Button type="submit">Generate Bill</Button>
      </div>
    </form>
  );
};
