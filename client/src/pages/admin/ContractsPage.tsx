import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Eye, Send, CreditCard, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/layouts/AdminLayout';

// Types
type Contract = {
  id: number;
  contractNumber: string;
  estimateId?: number;
  contactId: number;
  customerUserId?: number;
  projectId?: number;
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
  sentAt?: string;
  viewedAt?: string;
  createdBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  contactName?: string; // For UI
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

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch all contracts
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/contracts');
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      return response.json();
    },
  });

  // Send contract
  const sendMutation = useMutation({
    mutationFn: async (contractId: number) => {
      const response = await fetch(`/api/admin/contracts/${contractId}/send`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to send contract');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  // Create invoice from payment schedule
  const createInvoiceMutation = useMutation({
    mutationFn: async ({ contractId, paymentScheduleItemId }: { contractId: number, paymentScheduleItemId: string }) => {
      const response = await fetch(`/api/admin/contracts/${contractId}/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentScheduleItemId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      // Navigate to the new invoice
      navigate(`/admin/invoices/${data.id}`);
    },
  });

  // Filter contracts based on active tab and search query
  const filteredContracts = contracts?.filter((contract: Contract) => {
    const matchesTab = activeTab === 'all' || contract.status === activeTab;
    const matchesSearch = 
      searchQuery === '' || 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts Management</h1>
        <Button onClick={() => navigate('/admin/contracts/create')}>
          <Plus className="mr-2 h-4 w-4" /> Create Contract
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search contracts..."
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
          <TabsTrigger value="signed">Signed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>
            Manage all your customer contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading contracts...</div>
          ) : filteredContracts?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract: Contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.contractNumber}</TableCell>
                    <TableCell>{contract.contactName || 'Unknown'}</TableCell>
                    <TableCell>{contract.title}</TableCell>
                    <TableCell>${contract.amount}</TableCell>
                    <TableCell>
                      {contract.startDate ? format(new Date(contract.startDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[contract.status]}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {contract.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/contracts/edit/${contract.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {contract.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendMutation.mutate(contract.id)}
                          >
                            <Send className="h-4 w-4" />
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
              No contracts found. Create your first contract or convert an approved estimate!
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Contract Dialog */}
      {selectedContract && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contract {selectedContract.contractNumber}</DialogTitle>
              <DialogDescription>
                <Badge className={statusColors[selectedContract.status]}>
                  {selectedContract.status.charAt(0).toUpperCase() + selectedContract.status.slice(1)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Customer</h3>
                  <p>{selectedContract.contactName || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Date</h3>
                  <p>{format(new Date(selectedContract.createdAt), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Start Date</h3>
                  <p>
                    {selectedContract.startDate 
                      ? format(new Date(selectedContract.startDate), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">End Date</h3>
                  <p>
                    {selectedContract.endDate 
                      ? format(new Date(selectedContract.endDate), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedContract.title}</h3>
                {selectedContract.description && (
                  <p className="text-gray-700">{selectedContract.description}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Contract Amount</h3>
                <p className="text-xl font-bold">${selectedContract.amount}</p>
              </div>
              
              {selectedContract.paymentTerms && (
                <div>
                  <h3 className="font-medium mb-1">Payment Terms</h3>
                  <p>{selectedContract.paymentTerms}</p>
                </div>
              )}
              
              {/* Payment Schedule */}
              {selectedContract.paymentSchedule && selectedContract.paymentSchedule.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Payment Schedule</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedContract.paymentSchedule.map((item) => (
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
                          <TableCell>
                            {item.status === 'scheduled' && selectedContract.status === 'signed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  createInvoiceMutation.mutate({
                                    contractId: selectedContract.id,
                                    paymentScheduleItemId: item.id
                                  });
                                  setIsViewDialogOpen(false);
                                }}
                              >
                                <CreditCard className="mr-2 h-4 w-4" /> Create Invoice
                              </Button>
                            )}
                            {item.status === 'invoiced' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // This would navigate to the invoice for this payment
                                  // For now, we'll just close the dialog
                                  setIsViewDialogOpen(false);
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" /> View Invoice
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <Separator />
              
              {/* Contract Body - in a real app, you might format this better */}
              <div>
                <h3 className="font-medium mb-3">Contract Terms</h3>
                <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
                  {selectedContract.contractBody}
                </div>
              </div>
              
              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Customer Signature</h3>
                  {selectedContract.customerSignature ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Signed on {format(new Date(selectedContract.customerSignedAt || ''), 'MMM d, yyyy')}
                      </p>
                      <div className="mt-2 p-2 border rounded bg-gray-50">
                        {/* In a real app, this would show an image or signature data */}
                        <p className="italic">Signature on file</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not signed yet</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Company Signature</h3>
                  {selectedContract.companySignature ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Signed on {format(new Date(selectedContract.companySignedAt || ''), 'MMM d, yyyy')}
                      </p>
                      <div className="mt-2 p-2 border rounded bg-gray-50">
                        <p className="italic">Signature on file</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not signed yet</p>
                  )}
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Created:</span>
                    <span>{format(new Date(selectedContract.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  
                  {selectedContract.sentAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Sent:</span>
                      <span>{format(new Date(selectedContract.sentAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {selectedContract.viewedAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Viewed:</span>
                      <span>{format(new Date(selectedContract.viewedAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {selectedContract.customerSignedAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Signed:</span>
                      <span>{format(new Date(selectedContract.customerSignedAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 mt-6">
              {selectedContract.status === 'draft' && (
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/admin/contracts/edit/${selectedContract.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
              
              {selectedContract.status === 'draft' && (
                <Button 
                  onClick={() => {
                    sendMutation.mutate(selectedContract.id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Send className="mr-2 h-4 w-4" /> Send to Customer
                </Button>
              )}
              
              {selectedContract.status === 'signed' && (
                <Button 
                  onClick={() => {
                    navigate(`/admin/contracts/${selectedContract.id}/project`);
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" /> Manage Project
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </AdminLayout>
  );
}