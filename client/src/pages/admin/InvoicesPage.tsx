import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Eye, Send, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';

// Types
type Invoice = {
  id: number;
  invoiceNumber: string;
  contactId: number;
  customerUserId?: number;
  projectId?: number;
  contractId?: number;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  subtotal: string;
  tax?: string;
  discount?: string;
  total: string;
  amountPaid: string;
  amountDue: string;
  dueDate?: string;
  notes?: string;
  paymentTerms?: string;
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdBy?: string;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
  contactName?: string; // For UI
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  totalPrice: string;
  category?: string;
  notes?: string;
};

type Payment = {
  amount: string;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
};

// Status badge colors
const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  viewed: 'bg-yellow-500',
  partially_paid: 'bg-yellow-500',
  paid: 'bg-green-500',
  overdue: 'bg-red-500',
  cancelled: 'bg-red-500',
};

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentData, setPaymentData] = useState<Payment>({
    amount: '',
    paymentMethod: 'credit_card',
    paymentReference: '',
    notes: '',
  });
  
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch all invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await fetch('/api/admin/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    },
  });

  // Send invoice
  const sendMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ invoiceId, payment }: { invoiceId: number, payment: Payment }) => {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/record-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payment,
          contactId: selectedInvoice?.contactId, // Required field from the backend
          invoiceId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record payment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsPaymentDialogOpen(false);
    },
  });

  // Process invoices to add UI-friendly properties
  const processedInvoices = invoices?.map((invoice: Invoice) => {
    // Check if invoice is overdue
    let status = invoice.status;
    if (status !== 'paid' && status !== 'cancelled' && invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      if (isAfter(new Date(), dueDate)) {
        status = 'overdue';
      }
    }
    
    return {
      ...invoice,
      status,
    };
  });

  // Filter invoices based on active tab and search query
  const filteredInvoices = processedInvoices?.filter((invoice: Invoice) => {
    const matchesTab = activeTab === 'all' || invoice.status === activeTab;
    const matchesSearch = 
      searchQuery === '' || 
      invoice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Handler for payment form
  const handlePaymentChange = (field: keyof Payment, value: string) => {
    setPaymentData({
      ...paymentData,
      [field]: value,
    });
  };

  const handleRecordPayment = () => {
    if (selectedInvoice) {
      recordPaymentMutation.mutate({
        invoiceId: selectedInvoice.id,
        payment: paymentData,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices Management</h1>
        <Button onClick={() => navigate('/admin/invoices/create')}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="viewed">Viewed</TabsTrigger>
          <TabsTrigger value="partially_paid">Partially Paid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Manage all your customer invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading invoices...</div>
          ) : filteredInvoices?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.contactName || 'Unknown'}</TableCell>
                    <TableCell>{invoice.title}</TableCell>
                    <TableCell>${invoice.total}</TableCell>
                    <TableCell>
                      {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {invoice.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/invoices/edit/${invoice.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {invoice.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendMutation.mutate(invoice.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'partially_paid' || invoice.status === 'overdue') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setPaymentData({
                                ...paymentData,
                                amount: invoice.amountDue,
                              });
                              setIsPaymentDialogOpen(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              No invoices found. Create your first invoice!
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      {selectedInvoice && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                <Badge className={statusColors[selectedInvoice.status]}>
                  {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1).replace('_', ' ')}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Customer</h3>
                  <p>{selectedInvoice.contactName || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Date</h3>
                  <p>{format(new Date(selectedInvoice.createdAt), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Due Date</h3>
                  <p className={selectedInvoice.status === 'overdue' ? 'text-red-500 font-semibold' : ''}>
                    {selectedInvoice.dueDate 
                      ? format(new Date(selectedInvoice.dueDate), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Payment Status</h3>
                  <div className="flex items-center space-x-2">
                    {selectedInvoice.status === 'paid' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : selectedInvoice.status === 'overdue' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                    <span className={selectedInvoice.status === 'overdue' ? 'text-red-500' : ''}>
                      {selectedInvoice.amountPaid && selectedInvoice.total 
                        ? `$${selectedInvoice.amountPaid} of $${selectedInvoice.total} (${
                            parseFloat(selectedInvoice.amountPaid) / parseFloat(selectedInvoice.total) * 100
                          }%)`
                        : 'Not paid'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedInvoice.title}</h3>
                {selectedInvoice.description && (
                  <p className="text-gray-700">{selectedInvoice.description}</p>
                )}
              </div>
              
              <Separator />
              
              {/* Line Items */}
              <div>
                <h3 className="font-medium mb-3">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.unit}</TableCell>
                        <TableCell className="text-right">${item.unitPrice}</TableCell>
                        <TableCell className="text-right">${item.totalPrice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-1/3 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.subtotal}</span>
                  </div>
                  
                  {selectedInvoice.tax && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedInvoice.tax}</span>
                    </div>
                  )}
                  
                  {selectedInvoice.discount && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${selectedInvoice.discount}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${selectedInvoice.total}</span>
                  </div>
                  
                  {parseFloat(selectedInvoice.amountPaid) > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid:</span>
                        <span>${selectedInvoice.amountPaid}</span>
                      </div>
                      
                      <div className="flex justify-between font-bold">
                        <span>Amount Due:</span>
                        <span>${selectedInvoice.amountDue}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-medium mb-1">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                </div>
              )}
              
              {/* Payment Terms */}
              {selectedInvoice.paymentTerms && (
                <div>
                  <h3 className="font-medium mb-1">Payment Terms</h3>
                  <p className="text-sm text-gray-700">{selectedInvoice.paymentTerms}</p>
                </div>
              )}
              
              {/* Timeline */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Created:</span>
                    <span>{format(new Date(selectedInvoice.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  
                  {selectedInvoice.sentAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Sent:</span>
                      <span>{format(new Date(selectedInvoice.sentAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {selectedInvoice.viewedAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Viewed:</span>
                      <span>{format(new Date(selectedInvoice.viewedAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {selectedInvoice.paidAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Paid:</span>
                      <span>{format(new Date(selectedInvoice.paidAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 mt-6">
              {selectedInvoice.status === 'draft' && (
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/admin/invoices/edit/${selectedInvoice.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
              
              {selectedInvoice.status === 'draft' && (
                <Button 
                  onClick={() => {
                    sendMutation.mutate(selectedInvoice.id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Send className="mr-2 h-4 w-4" /> Send to Customer
                </Button>
              )}
              
              {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'viewed' || 
                selectedInvoice.status === 'partially_paid' || selectedInvoice.status === 'overdue') && (
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setPaymentData({
                      ...paymentData,
                      amount: selectedInvoice.amountDue,
                    });
                    setIsPaymentDialogOpen(true);
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Record Payment Dialog */}
      {selectedInvoice && (
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for invoice {selectedInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={paymentData.amount}
                  onChange={(e) => handlePaymentChange('amount', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Amount due: ${selectedInvoice.amountDue}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => handlePaymentChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentReference">Reference Number</Label>
                <Input
                  id="paymentReference"
                  placeholder="Transaction or check number"
                  value={paymentData.paymentReference}
                  onChange={(e) => handlePaymentChange('paymentReference', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Additional payment details"
                  value={paymentData.notes}
                  onChange={(e) => handlePaymentChange('notes', e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment}>
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </AdminLayout>
  );
}