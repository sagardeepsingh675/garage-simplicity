
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Filter, FileText, Printer, Search, IndianRupee } from 'lucide-react';
import { toast } from '@/lib/toast';
import { printInvoice, getInvoices, getInvoiceById, updateInvoiceStatus, InvoiceWithRelations, InvoiceStatus } from '@/services/billingService';
import { useSearchParams } from 'react-router-dom';
import { BillingForm } from '@/components/BillingForm';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

const getStatusBadgeVariant = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid': return 'default';
    case 'unpaid': return 'outline';
    case 'overdue': return 'destructive';
    case 'cancelled': return 'secondary';
    default: return 'outline';
  }
};

const Billing = () => {
  const [searchParams] = useSearchParams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const invoiceId = searchParams.get('invoice');
    if (invoiceId) {
      setSelectedInvoiceId(invoiceId);
    }
  }, [searchParams]);

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices
  });

  const filteredInvoices = React.useMemo(() => {
    if (!invoicesQuery.data) return [];
    
    return invoicesQuery.data.filter((invoice: InvoiceWithRelations) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        (invoice.customers?.name && invoice.customers.name.toLowerCase().includes(searchLower)) ||
        (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchLower)) ||
        (invoice.id && invoice.id.toLowerCase().includes(searchLower));
      
      let matchesStatus = true;
      if (filterStatus) {
        matchesStatus = invoice.status === filterStatus;
      } else if (activeTab !== 'all') {
        matchesStatus = invoice.status === activeTab;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [invoicesQuery.data, searchQuery, filterStatus, activeTab]);

  const selectedInvoiceQuery = useQuery({
    queryKey: ['invoice', selectedInvoiceId],
    queryFn: () => selectedInvoiceId ? getInvoiceById(selectedInvoiceId) : null,
    enabled: !!selectedInvoiceId
  });

  const handleCreateInvoice = () => {
    setCreateDialogOpen(true);
  };

  const handleInvoiceCreated = () => {
    setCreateDialogOpen(false);
    invoicesQuery.refetch();
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await updateInvoiceStatus(invoiceId, 'paid');
      invoicesQuery.refetch();
      if (selectedInvoiceId === invoiceId) {
        selectedInvoiceQuery.refetch();
      }
      toast.success('Invoice marked as paid');
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  const handlePrintInvoice = async (invoiceId: string) => {
    try {
      const data = await printInvoice(invoiceId);
      if (!data) {
        toast.error('Failed to load invoice data');
        return;
      }

      const { invoice, customer, businessSettings } = data;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups for this website.');
        return;
      }

      const invoiceDate = invoice.created_at 
        ? new Date(invoice.created_at).toLocaleDateString() 
        : 'N/A';
      
      const dueDate = invoice.due_date 
        ? new Date(invoice.due_date).toLocaleDateString() 
        : 'N/A';

      let gstAmount = 0;
      let showGst = false;
      let gstPercentage = 0;
      
      if (businessSettings?.show_gst_on_invoice && businessSettings?.gst_percentage) {
        showGst = true;
        gstPercentage = businessSettings.gst_percentage;
        gstAmount = (invoice.total_amount * gstPercentage) / 100;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoice_number || invoice.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .business-details {
              flex: 1;
            }
            .logo {
              max-width: 200px;
              max-height: 80px;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-details {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .invoice-details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .customer-details {
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .totals {
              margin-left: auto;
              width: 300px;
            }
            .totals table {
              margin-bottom: 0;
            }
            .total-row {
              font-weight: bold;
            }
            .grand-total-row {
              font-weight: bold;
              font-size: 1.1em;
              background-color: #f2f2f2;
            }
            .notes {
              margin-top: 30px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            .damage-image {
              max-width: 100%;
              margin-top: 20px;
              border: 1px solid #ddd;
            }
            @media print {
              body {
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div class="business-details">
                <h1 class="invoice-title">${businessSettings?.business_name || 'Auto Garage'}</h1>
                <p>${businessSettings?.business_address || ''}</p>
                <p>Phone: ${businessSettings?.business_phone || ''}</p>
                ${businessSettings?.gst_number ? `<p>GST: ${businessSettings.gst_number}</p>` : ''}
              </div>
              ${businessSettings?.logo_url ? `<img src="${businessSettings.logo_url}" class="logo" alt="Business Logo">` : ''}
            </div>
            
            <div class="invoice-title">INVOICE ${invoice.invoice_number || `#${invoice.id.substring(0, 8)}`}</div>
            
            <div class="invoice-details">
              <div class="invoice-details-grid">
                <div>
                  <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
                  <p><strong>Due Date:</strong> ${dueDate}</p>
                  <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
                </div>
                <div>
                  <p><strong>Invoice Number:</strong> ${invoice.invoice_number || invoice.id.substring(0, 8)}</p>
                  ${invoice.job_card_id ? `<p><strong>Job Card:</strong> #${typeof invoice.job_card_id === 'object' ? invoice.job_card_id.id?.substring(0, 8) : invoice.job_card_id.substring(0, 8)}</p>` : ''}
                  ${invoice.payment_method ? `<p><strong>Payment Method:</strong> ${invoice.payment_method}</p>` : ''}
                </div>
              </div>
            </div>
            
            <div class="customer-details">
              <h2>Bill To:</h2>
              <p><strong>${customer.name}</strong></p>
              <p>${customer.address || ''}</p>
              <p>Phone: ${customer.phone || ''}</p>
              <p>Email: ${customer.email || ''}</p>
            </div>
            
            ${invoice.services && Array.isArray(invoice.services) && invoice.services.length > 0 ? `
            <h3>Services</h3>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Hours</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.services.map((service: any) => `
                <tr>
                  <td>${service.name}</td>
                  <td>${service.hours}</td>
                  <td>${formatCurrency(service.rate)}</td>
                  <td>${formatCurrency(service.total)}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
            ` : ''}
            
            ${invoice.parts && Array.isArray(invoice.parts) && invoice.parts.length > 0 ? `
            <h3>Parts</h3>
            <table>
              <thead>
                <tr>
                  <th>Part</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.parts.map((part: any) => `
                <tr>
                  <td>${part.name}</td>
                  <td>${part.quantity}</td>
                  <td>${formatCurrency(part.price)}</td>
                  <td>${formatCurrency(part.total)}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
            ` : ''}
            
            <div class="totals">
              <table>
                <tr>
                  <td>Subtotal:</td>
                  <td>${formatCurrency(invoice.total_amount)}</td>
                </tr>
                ${showGst ? `
                <tr>
                  <td>GST (${gstPercentage}%):</td>
                  <td>${formatCurrency(gstAmount)}</td>
                </tr>
                ` : ''}
                <tr class="grand-total-row">
                  <td>Total:</td>
                  <td>${formatCurrency(invoice.grand_total)}</td>
                </tr>
              </table>
            </div>
            
            ${invoice.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${invoice.notes}</p>
            </div>
            ` : ''}
            
            ${invoice.vehicle_damage_image ? `
            <div>
              <h3>Vehicle Damage Assessment:</h3>
              <img src="${invoice.vehicle_damage_image}" class="damage-image" alt="Vehicle Damage">
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
          
          <button onclick="window.print();" style="padding: 10px 20px; margin: 20px 0; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Invoice</button>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 1000);
      
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('Failed to print invoice');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setFilterStatus(filterStatus ? null : 'unpaid')}
            >
              <Filter className="h-4 w-4" />
              {filterStatus ? 'Clear Filter' : 'Filter Unpaid'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading invoices...</TableCell>
                      </TableRow>
                    ) : filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          {searchQuery || filterStatus
                            ? 'No invoices match your search criteria'
                            : 'No invoices found. Create your first invoice!'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice: InvoiceWithRelations) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number || invoice.id.substring(0, 8)}</TableCell>
                          <TableCell>{invoice.customers?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            {invoice.created_at
                              ? new Date(invoice.created_at).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {invoice.due_date
                              ? new Date(invoice.due_date).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center">
                              <IndianRupee className="h-3 w-3 mr-1" />
                              {invoice.grand_total.toLocaleString('en-IN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(invoice.status as InvoiceStatus)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedInvoiceId(invoice.id)}
                                title="View Invoice"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePrintInvoice(invoice.id)}
                                title="Print Invoice"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {invoice.status === 'unpaid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                  className="whitespace-nowrap"
                                >
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <BillingForm onSuccess={handleInvoiceCreated} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedInvoiceId} onOpenChange={(open) => {
        if (!open) setSelectedInvoiceId(null);
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoiceId && (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handlePrintInvoice(selectedInvoiceId)}
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </Button>
                {selectedInvoiceQuery.data?.status === 'unpaid' && (
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => handleMarkAsPaid(selectedInvoiceId)}
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
              
              {selectedInvoiceQuery.isLoading ? (
                <div className="py-10 text-center text-muted-foreground">
                  Loading invoice details...
                </div>
              ) : selectedInvoiceQuery.data ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">
                            Invoice {selectedInvoiceQuery.data.invoice_number || `#${selectedInvoiceQuery.data.id.substring(0, 8)}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Created on {new Date(selectedInvoiceQuery.data.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(selectedInvoiceQuery.data.status as InvoiceStatus)}>
                          {selectedInvoiceQuery.data.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Customer</h4>
                          <p>{selectedInvoiceQuery.data.customers?.name}</p>
                          {selectedInvoiceQuery.data.customers?.phone && (
                            <p className="text-sm text-muted-foreground">{selectedInvoiceQuery.data.customers.phone}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <h4 className="text-sm font-medium mb-1">Amount</h4>
                          <p className="text-xl font-bold">{formatCurrency(selectedInvoiceQuery.data.grand_total)}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {selectedInvoiceQuery.data.due_date
                              ? new Date(selectedInvoiceQuery.data.due_date).toLocaleDateString()
                              : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <p className="text-center text-muted-foreground">
                    Use the print button to view the full invoice details
                  </p>
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  Invoice not found or error loading details
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Billing;
