import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CustomerLayout from '@/layouts/CustomerLayout';

type Estimate = {
  id: number;
  estimateNumber: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'converted';
  subtotal: string;
  tax?: string;
  discount?: string;
  total: string;
  validUntil?: string;
  notes?: string;
  termsAndConditions?: string;
  customerNotes?: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: string;
    totalPrice: string;
  }>;
  createdAt: string;
};

// Status badge colors
const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  viewed: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  converted: 'bg-purple-500',
};

export default function CustomerEstimates() {
  const [viewEstimate, setViewEstimate] = useState<Estimate | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch estimates for the current customer
  const { data: estimates, isLoading } = useQuery({
    queryKey: ['customer-estimates'],
    queryFn: async () => {
      const response = await fetch('/api/customer/estimates');
      if (!response.ok) {
        throw new Error('Failed to fetch estimates');
      }
      return response.json();
    },
  });

  // Mutation for approving estimate
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const response = await fetch(`/api/customer/estimates/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerNotes: notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve estimate');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-estimates'] });
      setIsViewOpen(false);
      toast({
        title: 'Estimate Approved',
        description: 'We will prepare your contract soon.',
      });
    },
  });

  // Mutation for rejecting estimate
  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const response = await fetch(`/api/customer/estimates/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerNotes: notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject estimate');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-estimates'] });
      setIsViewOpen(false);
      toast({
        title: 'Estimate Rejected',
        description: 'We will contact you soon to discuss further.',
      });
    },
  });

  // Open estimate detail
  const handleViewEstimate = (estimate: Estimate) => {
    // Mark estimate as viewed if it's in 'sent' status
    if (estimate.status === 'sent') {
      fetch(`/api/customer/estimates/${estimate.id}`, {
        method: 'GET',
      });
    }
    
    setViewEstimate(estimate);
    setIsViewOpen(true);
  };

  return (
    <CustomerLayout>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>
            Review, approve, or reject your estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading estimates...</div>
          ) : estimates?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((estimate: Estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell>{estimate.estimateNumber}</TableCell>
                    <TableCell>{estimate.title}</TableCell>
                    <TableCell>{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>${estimate.total}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[estimate.status]}>
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewEstimate(estimate)}
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
              <p>You don't have any estimates yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estimate Detail Dialog */}
      {viewEstimate && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Estimate {viewEstimate.estimateNumber}</DialogTitle>
              <DialogDescription>
                <Badge className={statusColors[viewEstimate.status]}>
                  {viewEstimate.status.charAt(0).toUpperCase() + viewEstimate.status.slice(1)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{viewEstimate.title}</h3>
                {viewEstimate.description && (
                  <p className="text-gray-700">{viewEstimate.description}</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Created on: {format(new Date(viewEstimate.createdAt), 'MMMM d, yyyy')}</p>
                {viewEstimate.validUntil && (
                  <p className="text-sm text-gray-500">
                    Valid until: {format(new Date(viewEstimate.validUntil), 'MMMM d, yyyy')}
                  </p>
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
                    {viewEstimate.lineItems.map((item) => (
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
                    <span>${viewEstimate.subtotal}</span>
                  </div>
                  
                  {viewEstimate.tax && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${viewEstimate.tax}</span>
                    </div>
                  )}
                  
                  {viewEstimate.discount && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${viewEstimate.discount}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${viewEstimate.total}</span>
                  </div>
                </div>
              </div>
              
              {/* Terms & Notes */}
              {viewEstimate.termsAndConditions && (
                <div>
                  <h3 className="font-medium mb-1">Terms & Conditions</h3>
                  <p className="text-sm text-gray-700">{viewEstimate.termsAndConditions}</p>
                </div>
              )}
              
              {viewEstimate.notes && (
                <div>
                  <h3 className="font-medium mb-1">Notes</h3>
                  <p className="text-sm text-gray-700">{viewEstimate.notes}</p>
                </div>
              )}
              
              {/* Feedback form for pending approval */}
              {(viewEstimate.status === 'sent' || viewEstimate.status === 'viewed') && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Your Feedback</h3>
                  <Textarea 
                    placeholder="Optional comments or questions about this estimate..." 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 mt-6">
              {(viewEstimate.status === 'sent' || viewEstimate.status === 'viewed') && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => rejectMutation.mutate({ id: viewEstimate.id, notes: feedbackText })}
                    className="bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" /> Decline Estimate
                  </Button>
                  
                  <Button
                    onClick={() => approveMutation.mutate({ id: viewEstimate.id, notes: feedbackText })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" /> Approve Estimate
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </CustomerLayout>
  );
}