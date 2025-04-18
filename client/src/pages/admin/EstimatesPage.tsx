import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Eye, Send, Check, X, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/layouts/AdminLayout';

// Type for Estimate
type Estimate = {
  id: number;
  contactId: number;
  customerUserId?: number;
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
  sentAt?: string;
  viewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdBy?: string;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
  contactName?: string; // Added for UI
};

// Type for Line Item
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

// Type for Contact
type Contact = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
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

// Main Estimates Page Component
export default function EstimatesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch all estimates
  const { data: estimates, isLoading } = useQuery({
    queryKey: ['estimates'],
    queryFn: async () => {
      const response = await fetch('/api/admin/estimates');
      if (!response.ok) {
        throw new Error('Failed to fetch estimates');
      }
      return response.json();
    },
  });

  // Fetch contacts for the dropdown
  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/crm/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });

  // Convert estimate status
  const convertMutation = useMutation({
    mutationFn: async (estimateId: number) => {
      const response = await fetch(`/api/admin/estimates/${estimateId}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to convert estimate to contract');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      // Navigate to the new contract
      navigate(`/admin/contracts/${data.id}`);
    },
  });

  // Send estimate
  const sendMutation = useMutation({
    mutationFn: async (estimateId: number) => {
      const response = await fetch(`/api/admin/estimates/${estimateId}/send`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to send estimate');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
  });

  // Filter estimates based on active tab and search query
  const filteredEstimates = estimates?.filter((estimate: Estimate) => {
    const matchesTab = activeTab === 'all' || estimate.status === activeTab;
    const matchesSearch = 
      searchQuery === '' || 
      estimate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.estimateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estimates Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Estimate
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search estimates..."
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
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="converted">Converted</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>
            Manage all your customer estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading estimates...</div>
          ) : filteredEstimates?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((estimate: Estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell>{estimate.estimateNumber}</TableCell>
                    <TableCell>{estimate.contactName || 'Unknown'}</TableCell>
                    <TableCell>{estimate.title}</TableCell>
                    <TableCell>${estimate.total}</TableCell>
                    <TableCell>{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[estimate.status]}>
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEstimate(estimate);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {estimate.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/estimates/edit/${estimate.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {estimate.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendMutation.mutate(estimate.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {estimate.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => convertMutation.mutate(estimate.id)}
                          >
                            <ArrowRight className="h-4 w-4" />
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
              No estimates found. Create your first estimate!
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Estimate Dialog */}
      {selectedEstimate && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Estimate {selectedEstimate.estimateNumber}</DialogTitle>
              <DialogDescription>
                <Badge className={statusColors[selectedEstimate.status]}>
                  {selectedEstimate.status.charAt(0).toUpperCase() + selectedEstimate.status.slice(1)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Customer</h3>
                  <p>{selectedEstimate.contactName || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Date</h3>
                  <p>{format(new Date(selectedEstimate.createdAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedEstimate.title}</h3>
                {selectedEstimate.description && (
                  <p className="text-gray-700">{selectedEstimate.description}</p>
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
                    {selectedEstimate.lineItems.map((item) => (
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
                    <span>${selectedEstimate.subtotal}</span>
                  </div>
                  
                  {selectedEstimate.tax && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedEstimate.tax}</span>
                    </div>
                  )}
                  
                  {selectedEstimate.discount && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${selectedEstimate.discount}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${selectedEstimate.total}</span>
                  </div>
                </div>
              </div>
              
              {/* Terms & Notes */}
              {selectedEstimate.termsAndConditions && (
                <div>
                  <h3 className="font-medium mb-1">Terms & Conditions</h3>
                  <p className="text-sm text-gray-700">{selectedEstimate.termsAndConditions}</p>
                </div>
              )}
              
              {selectedEstimate.notes && (
                <div>
                  <h3 className="font-medium mb-1">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedEstimate.notes}</p>
                </div>
              )}
              
              {/* Customer feedback */}
              {selectedEstimate.customerNotes && (
                <Alert variant={selectedEstimate.status === 'rejected' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <h3 className="font-medium">Customer Feedback:</h3>
                    <p>{selectedEstimate.customerNotes}</p>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Timeline */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-32 text-gray-500">Created:</span>
                    <span>{format(new Date(selectedEstimate.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  
                  {selectedEstimate.sentAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Sent:</span>
                      <span>{format(new Date(selectedEstimate.sentAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {selectedEstimate.viewedAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Viewed:</span>
                      <span>{format(new Date(selectedEstimate.viewedAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {selectedEstimate.approvedAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Approved:</span>
                      <span>{format(new Date(selectedEstimate.approvedAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {selectedEstimate.rejectedAt && (
                    <div className="flex items-center">
                      <span className="w-32 text-gray-500">Rejected:</span>
                      <span>{format(new Date(selectedEstimate.rejectedAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 mt-6">
              {selectedEstimate.status === 'draft' && (
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/admin/estimates/edit/${selectedEstimate.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
              
              {selectedEstimate.status === 'draft' && (
                <Button 
                  onClick={() => {
                    sendMutation.mutate(selectedEstimate.id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Send className="mr-2 h-4 w-4" /> Send to Customer
                </Button>
              )}
              
              {selectedEstimate.status === 'approved' && (
                <Button 
                  onClick={() => {
                    convertMutation.mutate(selectedEstimate.id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" /> Convert to Contract
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create/Edit Estimate Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Estimate</DialogTitle>
            <DialogDescription>
              Select a customer to create an estimate for.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Select Customer</Label>
              <Select
                onValueChange={(value) => {
                  try {
                    // Store selected value in state instead of sessionStorage
                    localStorage.setItem('selectedCustomerId', value);
                  } catch (err) {
                    console.error("Failed to store customer ID:", err);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.map((contact: Contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsCreateDialogOpen(false);
              navigate('/admin/estimates/create');
            }}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}