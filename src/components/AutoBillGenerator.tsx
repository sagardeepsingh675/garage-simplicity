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
import { getJobCardsByVehicleId } from '@/services/jobCardService';

// Define the props for the AutoBillGenerator component
interface AutoBillGeneratorProps {
  vehicleData: any;
  customerData?: any;
  onGenerateBill: (billData: any) => void;
}

// AutoBillGenerator component
export const AutoBillGenerator: React.FC<AutoBillGeneratorProps> = ({ vehicleData, customerData, onGenerateBill }) => {
  const [subtotal, setSubtotal] = useState(0);
  const [parts, setParts] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [services, setServices] = useState([{ name: '', hours: 1, rate: 0 }]);
  const [notes, setNotes] = useState('');
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(0);
  const [damageImageUrl, setDamageImageUrl] = useState<string | null>(null);
  const [selectedJobCard, setSelectedJobCard] = useState<any>(null);
  const [jobCards, setJobCards] = useState<any[]>([]);
  
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

  // Function to calculate subtotal
  useEffect(() => {
    const partsTotal = parts.reduce((acc, part) => acc + (part.quantity * part.price), 0);
    const servicesTotal = services.reduce((acc, service) => acc + (service.hours * service.rate), 0);
    setSubtotal(partsTotal + servicesTotal);
  }, [parts, services]);

  // Handlers for parts
  const addPart = () => setParts([...parts, { name: '', quantity: 1, price: 0 }]);
  const updatePart = (index: number, field: string, value: any) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };
  const removePart = (index: number) => {
    const newParts = [...parts];
    newParts.splice(index, 1);
    setParts(newParts);
  };

  // Handlers for services
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate the total including tax
    const taxAmount = isGstEnabled ? subtotal * (gstPercentage / 100) : 0;
    const totalAmount = subtotal + taxAmount;
    
    // Call the parent component's callback with all the invoice data
    onGenerateBill({
      subtotal,
      taxAmount,
      total: totalAmount,
      parts,
      services,
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Parts</CardTitle>
          <CardDescription>Add parts used for the service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {parts.map((part, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center">
              <Input
                type="text"
                placeholder="Part Name"
                value={part.name}
                onChange={(e) => updatePart(index, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={part.quantity}
                onChange={(e) => updatePart(index, 'quantity', Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Price"
                value={part.price}
                onChange={(e) => updatePart(index, 'price', Number(e.target.value))}
              />
              <Button type="button" variant="destructive" size="sm" onClick={() => removePart(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addPart}>
            Add Part
          </Button>
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
          <VehicleCanvas vehicleType="sedan" onChange={setDamageImageUrl} />
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
