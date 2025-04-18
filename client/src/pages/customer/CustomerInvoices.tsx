import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isAfter } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Eye, CreditCard, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CustomerLayout from '@/layouts/CustomerLayout';

type Invoice = {
  id: number;
  invoiceNumber: string;
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
  lineItems: LineItem[];
  createdAt: string;
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  totalPrice: string;
};

type Payment = {
  paymentMethod: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardholderName?: string;
  billingAddress?: string;
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

export default function CustomerInvoices() {
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: '',
    billingAddress: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invoices for the current customer
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['customer-invoices'],
    queryFn: async () => {
      const response = await fetch('/api/customer/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    },
  });

  // Mutation for making a payment
  const paymentMutation = useMutation({
    mutationFn: async ({ id, payment }: { id: number; payment: Payment }) => {
      // In a real app, this would connect to a payment processor
      // For now, we'll just make a basic API call
      const response = await fetch(`/api/customer/invoices/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: viewInvoice?.amountDue,
          paymentMethod: payment.paymentMethod,
          paymentReference: payment.cardNumber ? `xxxx-xxxx-xxxx-${payment.cardNumber.slice(-4)}` : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Payment processing failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
      setIsPaymentOpen(false);
      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully.',
      });
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

  // Open invoice detail
  const handleViewInvoice = (invoice: Invoice) => {
    // Mark invoice as viewed if it's in 'sent' status
    if (invoice.status === 'sent') {
      fetch(`/api/customer/invoices/${invoice.id}`, {
        method: 'GET',
      });
    }
    
    setViewInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleOpenPaymentDialog = () => {
    if (viewInvoice) {
      setIsViewOpen(false);
      setIsPaymentOpen(true);
    }
  };

  const handleCardDetailsChange = (field: string, value: string) => {
    setCardDetails({
      ...cardDetails,
      [field]: value,
    });
  };

  const handlePayInvoice = () => {
    if (!viewInvoice) return;
    
    // Basic validation
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.cardNumber || !cardDetails.cardExpiry || !cardDetails.cardCvv || !cardDetails.cardholderName) {
        toast({
          title: 'Missing Information',
          description: 'Please fill out all required card details.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // Process payment
    paymentMutation.mutate({
      id: viewInvoice.id,
      payment: {
        paymentMethod,
        ...cardDetails,
      },
    });
  };

  return (
    <CustomerLayout>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            View and pay your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading invoices...</div>
          ) : processedInvoices?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedInvoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.title}</TableCell>
                    <TableCell>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className={invoice.status === 'overdue' ? 'text-red-500 font-semibold' : ''}>
                      {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>${invoice.total}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>
                        {invoice.status === 'partially_paid' 
                          ? 'Partially Paid' 
                          : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p>You don't have any invoices yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      {viewInvoice && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice {viewInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                <Badge className={statusColors[viewInvoice.status]}>
                  {viewInvoice.status === 'partially_paid' 
                    ? 'Partially Paid' 
                    : viewInvoice.status.charAt(0).toUpperCase() + viewInvoice.status.slice(1)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{viewInvoice.title}</h3>
                {viewInvoice.description && (
                  <p className="text-gray-700">{viewInvoice.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Invoice Date</h3>
                  <p>{format(new Date(viewInvoice.createdAt), 'MMMM d, yyyy')}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Due Date</h3>
                  <p className={viewInvoice.status === 'overdue' ? 'text-red-500 font-semibold' : ''}>
                    {viewInvoice.dueDate 
                      ? format(new Date(viewInvoice.dueDate), 'MMMM d, yyyy')
                      : 'Not specified'}
                    {viewInvoice.status === 'overdue' && (
                      <span className="ml-2 inline-flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> Overdue
                      </span>
                    )}
                  </p>
                </div>
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
                    {viewInvoice.lineItems.map((item) => (
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
                    <span>${viewInvoice.subtotal}</span>
                  </div>
                  
                  {viewInvoice.tax && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${viewInvoice.tax}</span>
                    </div>
                  )}
                  
                  {viewInvoice.discount && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${viewInvoice.discount}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${viewInvoice.total}</span>
                  </div>
                  
                  {parseFloat(viewInvoice.amountPaid) > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid:</span>
                        <span>${viewInvoice.amountPaid}</span>
                      </div>
                      
                      <div className="flex justify-between font-bold">
                        <span>Amount Due:</span>
                        <span className={viewInvoice.status === 'overdue' ? 'text-red-500' : ''}>
                          ${viewInvoice.amountDue}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Notes & Payment Terms */}
              {(viewInvoice.notes || viewInvoice.paymentTerms) && (
                <div className="border rounded-md p-4 bg-gray-50">
                  {viewInvoice.notes && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-1">Notes</h3>
                      <p className="text-sm text-gray-700">{viewInvoice.notes}</p>
                    </div>
                  )}
                  
                  {viewInvoice.paymentTerms && (
                    <div>
                      <h3 className="font-medium mb-1">Payment Terms</h3>
                      <p className="text-sm text-gray-700">{viewInvoice.paymentTerms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 mt-6">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              
              {(viewInvoice.status === 'sent' || viewInvoice.status === 'viewed' || 
                viewInvoice.status === 'partially_paid' || viewInvoice.status === 'overdue') && (
                <Button onClick={handleOpenPaymentDialog}>
                  <CreditCard className="mr-2 h-4 w-4" /> Pay Invoice
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {viewInvoice && (
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pay Invoice {viewInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                Amount Due: ${viewInvoice.amountDue}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card">Credit Card</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer">Bank Transfer</Label>
                </div>
              </RadioGroup>
              
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="**** **** **** ****" 
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input 
                        id="cardExpiry" 
                        placeholder="MM/YY" 
                        value={cardDetails.cardExpiry}
                        onChange={(e) => handleCardDetailsChange('cardExpiry', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input 
                        id="cardCvv" 
                        placeholder="***" 
                        value={cardDetails.cardCvv}
                        onChange={(e) => handleCardDetailsChange('cardCvv', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input 
                      id="cardholderName" 
                      placeholder="John Doe" 
                      value={cardDetails.cardholderName}
                      onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input 
                      id="billingAddress" 
                      placeholder="123 Main St, City, State, Zip" 
                      value={cardDetails.billingAddress}
                      onChange={(e) => handleCardDetailsChange('billingAddress', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {paymentMethod === 'bank_transfer' && (
                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <h3 className="font-medium mb-2">Bank Transfer Instructions</h3>
                  <p className="text-sm mb-2">
                    Please use the following information to make a bank transfer:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li><span className="font-medium">Bank:</span> APS Flooring Bank</li>
                    <li><span className="font-medium">Account Name:</span> APS Flooring LLC</li>
                    <li><span className="font-medium">Account Number:</span> 123456789</li>
                    <li><span className="font-medium">Routing Number:</span> 987654321</li>
                    <li><span className="font-medium">Reference:</span> {viewInvoice.invoiceNumber}</li>
                  </ul>
                  <p className="text-sm mt-2 text-gray-600">
                    After making the transfer, please email a confirmation to 
                    <a href="mailto:accounting@apsflooring.info" className="text-blue-600 ml-1">
                      accounting@apsflooring.info
                    </a>
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              {paymentMethod === 'credit_card' && (
                <Button onClick={handlePayInvoice}>
                  Pay ${viewInvoice.amountDue}
                </Button>
              )}
              {paymentMethod === 'bank_transfer' && (
                <Button onClick={() => setIsPaymentOpen(false)}>
                  I've Sent the Payment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </CustomerLayout>
  );
}