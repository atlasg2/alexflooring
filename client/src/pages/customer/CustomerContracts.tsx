import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Eye, FileSignature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SignatureCanvas from 'react-signature-canvas';
import CustomerLayout from '@/layouts/CustomerLayout';

type Contract = {
  id: number;
  contractNumber: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'cancelled';
  amount: string;
  startDate?: string;
  endDate?: string;
  paymentTerms?: string;
  paymentSchedule?: PaymentScheduleItem[];
  contractBody: string;
  customerSignature?: string;
  customerSignedAt?: string;
  companySignature?: string;
  companySignedAt?: string;
  createdAt: string;
};

type PaymentScheduleItem = {
  id: string;
  description: string;
  amount: string;
  dueDate: string;
  status: 'scheduled' | 'invoiced' | 'paid';
};

// Status badge colors
const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  viewed: 'bg-yellow-500',
  signed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const paymentStatusColors: Record<string, string> = {
  scheduled: 'bg-gray-500',
  invoiced: 'bg-yellow-500',
  paid: 'bg-green-500',
};

export default function CustomerContracts() {
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [sigCanvas, setSigCanvas] = useState<SignatureCanvas | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contracts for the current customer
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['customer-contracts'],
    queryFn: async () => {
      const response = await fetch('/api/customer/contracts');
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      return response.json();
    },
  });

  // Mutation for signing contract
  const signMutation = useMutation({
    mutationFn: async ({ id, signature }: { id: number; signature: string }) => {
      const response = await fetch(`/api/customer/contracts/${id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign contract');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-contracts'] });
      setIsSigningOpen(false);
      toast({
        title: 'Contract Signed',
        description: 'Your contract has been successfully signed!',
      });
    },
  });

  // Open contract detail
  const handleViewContract = (contract: Contract) => {
    // Mark contract as viewed if it's in 'sent' status
    if (contract.status === 'sent') {
      fetch(`/api/customer/contracts/${contract.id}`, {
        method: 'GET',
      });
    }
    
    setViewContract(contract);
    setIsViewOpen(true);
  };

  const handleOpenSigningDialog = () => {
    if (viewContract) {
      setIsViewOpen(false);
      setIsSigningOpen(true);
    }
  };

  const handleSignContract = () => {
    if (!sigCanvas || !viewContract) return;
    
    if (sigCanvas.isEmpty()) {
      toast({
        title: 'Signature Required',
        description: 'Please sign the contract before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert signature to data URL
    const signatureData = sigCanvas.toDataURL('image/png');
    
    // Submit signature to API
    signMutation.mutate({
      id: viewContract.id,
      signature: signatureData,
    });
  };

  const clearSignature = () => {
    if (sigCanvas) {
      sigCanvas.clear();
    }
  };

  return (
    <CustomerLayout>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>
            View and sign your contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading contracts...</div>
          ) : contracts?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract: Contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.contractNumber}</TableCell>
                    <TableCell>{contract.title}</TableCell>
                    <TableCell>{format(new Date(contract.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>${contract.amount}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[contract.status]}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewContract(contract)}
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
              <p>You don't have any contracts yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Detail Dialog */}
      {viewContract && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contract {viewContract.contractNumber}</DialogTitle>
              <DialogDescription>
                <Badge className={statusColors[viewContract.status]}>
                  {viewContract.status.charAt(0).toUpperCase() + viewContract.status.slice(1)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{viewContract.title}</h3>
                {viewContract.description && (
                  <p className="text-gray-700">{viewContract.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Contract Date</h3>
                  <p>{format(new Date(viewContract.createdAt), 'MMMM d, yyyy')}</p>
                </div>
                
                {viewContract.startDate && (
                  <div>
                    <h3 className="font-medium">Start Date</h3>
                    <p>{format(new Date(viewContract.startDate), 'MMMM d, yyyy')}</p>
                  </div>
                )}
                
                {viewContract.endDate && (
                  <div>
                    <h3 className="font-medium">End Date</h3>
                    <p>{format(new Date(viewContract.endDate), 'MMMM d, yyyy')}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium">Contract Amount</h3>
                  <p className="text-xl font-bold">${viewContract.amount}</p>
                </div>
              </div>
              
              {viewContract.paymentTerms && (
                <div>
                  <h3 className="font-medium">Payment Terms</h3>
                  <p>{viewContract.paymentTerms}</p>
                </div>
              )}
              
              {/* Payment Schedule */}
              {viewContract.paymentSchedule && viewContract.paymentSchedule.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Payment Schedule</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewContract.paymentSchedule.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>${item.amount}</TableCell>
                          <TableCell>
                            {format(new Date(item.dueDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge className={paymentStatusColors[item.status]}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <Separator />
              
              {/* Contract Body */}
              <div>
                <h3 className="font-medium mb-3">Contract Terms</h3>
                <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
                  {viewContract.contractBody}
                </div>
              </div>
              
              {/* Signatures */}
              {viewContract.status === 'signed' && (
                <div>
                  <h3 className="font-medium mb-3">Signatures</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Your Signature</h4>
                      <div className="border p-2 rounded">
                        {/* In a real app, this would show the actual signature image */}
                        <p className="italic">Signature on file</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Signed on {viewContract.customerSignedAt 
                            ? format(new Date(viewContract.customerSignedAt), 'MMM d, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {viewContract.companySignature && (
                      <div>
                        <h4 className="text-sm text-gray-500 mb-1">Company Signature</h4>
                        <div className="border p-2 rounded">
                          <p className="italic">Signature on file</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Signed on {viewContract.companySignedAt 
                              ? format(new Date(viewContract.companySignedAt), 'MMM d, yyyy')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 mt-6">
              {(viewContract.status === 'sent' || viewContract.status === 'viewed') && (
                <Button onClick={handleOpenSigningDialog}>
                  <FileSignature className="mr-2 h-4 w-4" /> Sign Contract
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Signature Dialog */}
      {viewContract && (
        <Dialog open={isSigningOpen} onOpenChange={setIsSigningOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Contract</DialogTitle>
              <DialogDescription>
                Please sign below to accept contract {viewContract.contractNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="border p-2 rounded mb-2">
                <p className="text-sm text-gray-600 mb-4">
                  By signing below, you agree to all the terms and conditions outlined in the contract.
                </p>
                
                <div className="border border-gray-300 rounded-md">
                  <SignatureCanvas
                    ref={(ref) => setSigCanvas(ref)}
                    penColor="black"
                    canvasProps={{ 
                      width: 500, 
                      height: 200, 
                      className: 'signature-canvas w-full'
                    }}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={clearSignature}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSigningOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignContract}>
                Submit Signature
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </CustomerLayout>
  );
}