import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  MessageSquare,
  AlertCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { Contact } from '@shared/schema';

const ContactsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Form state for new/edit contact
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    leadStage: 'new',
    source: 'manual',
    preferredContact: 'email',
    notes: '',
    tags: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  // Get contacts query
  const { data: contacts = [], isLoading, refetch } = useQuery<Contact[]>({
    queryKey: ['/api/admin/crm/contacts', searchQuery],
    queryFn: async () => {
      const url = searchQuery
        ? `/api/admin/crm/contacts/search?q=${encodeURIComponent(searchQuery)}`
        : '/api/admin/crm/contacts';
      return await getQueryFn({ on401: 'throw' })(url);
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  
  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/admin/crm/contacts', data);
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/crm/contacts'] });
      await refetch(); // Force immediate refetch
      toast({
        title: 'Contact created',
        description: 'The contact was created successfully',
      });
      setIsContactDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create contact: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Contact> }) => {
      const response = await apiRequest('PUT', `/api/admin/crm/contacts/${id}`, data);
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/crm/contacts'] });
      await refetch(); // Force immediate refetch
      toast({
        title: 'Contact updated',
        description: 'The contact was updated successfully',
      });
      setIsContactDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update contact: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/crm/contacts/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/crm/contacts'] });
      await refetch(); // Force immediate refetch
      toast({
        title: 'Contact deleted',
        description: 'The contact was deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete contact: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      leadStage: 'new',
      source: 'manual',
      preferredContact: 'email',
      notes: '',
      tags: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setSelectedContact(null);
  };
  
  // Open dialog for new contact
  const handleAddContact = () => {
    resetForm();
    setIsContactDialogOpen(true);
  };
  
  // Open dialog for editing contact
  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      leadStage: contact.leadStage,
      source: contact.source,
      preferredContact: contact.preferredContact || 'email',
      notes: contact.notes || '',
      tags: contact.tags ? contact.tags.join(', ') : '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zipCode: contact.zipCode || '',
    });
    setIsContactDialogOpen(true);
  };
  
  // Handle delete contact
  const handleDeleteContact = (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      deleteContactMutation.mutate(id);
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tags from comma-separated string to array
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const formattedData = {
      ...formData,
      tags: tags.length > 0 ? tags : undefined,
    };
    
    if (selectedContact) {
      updateContactMutation.mutate({ 
        id: selectedContact.id, 
        data: formattedData
      });
    } else {
      createContactMutation.mutate(formattedData as any);
    }
  };
  
  // Filter contacts for current page
  const paginatedContacts = contacts.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );
  
  const totalPages = Math.ceil(contacts.length / pageSize);
  const isMobile = useIsMobile();
  
  return (
    <AdminLayout title="Contact Management">
      <Card className="shadow-sm">
        <CardHeader className={`${isMobile ? 'flex-col space-y-4' : 'flex-row justify-between items-center'}`}>
          <div>
            <CardTitle className="text-2xl">CRM Contacts</CardTitle>
            <CardDescription>
              Manage customer contacts for marketing, projects, and communications
            </CardDescription>
          </div>
          <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'space-x-2'}`}>
            <div className={`relative ${isMobile ? 'w-full' : ''}`}>
              <Search className="absolute w-4 h-4 left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className={`pl-8 ${isMobile ? 'w-full' : 'w-64'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={`flex ${isMobile ? 'w-full space-x-2' : 'space-x-2'}`}>
              <Button 
                onClick={() => refetch()}
                variant="outline"
                className={isMobile ? 'flex-1' : ''}
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
                Refresh
              </Button>
              <Button 
                onClick={handleAddContact}
                className={isMobile ? 'flex-1' : ''}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No contacts found</p>
              <p className="text-muted-foreground">You don't have any contacts yet.</p>
              <Button onClick={handleAddContact} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add your first contact
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              {isMobile ? (
                // Mobile view - Card list instead of table
                <div className="flex flex-col divide-y">
                  {paginatedContacts.map((contact) => (
                    <div key={contact.id} className="p-4 border-b">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{contact.name}</div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">More options</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleEditContact(contact)}
                                className="cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteContact(contact.id)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send SMS
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-sm mb-2">
                        {contact.email && (
                          <div className="flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {contact.company && (
                          <div className="text-gray-500">
                            Company: <span className="text-gray-700">{contact.company}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant={
                              contact.leadStage === 'qualified' 
                                ? 'default'
                                : contact.leadStage === 'contacted' 
                                ? 'secondary'
                                : contact.leadStage === 'proposal' 
                                ? 'outline'
                                : contact.leadStage === 'won' 
                                ? 'success'
                                : contact.leadStage === 'lost' 
                                ? 'destructive'
                                : 'outline'
                            }
                            className="capitalize"
                          >
                            {contact.leadStage}
                          </Badge>
                          <span className="text-xs text-gray-500 capitalize">
                            Source: {contact.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop view - Table
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="font-medium">{contact.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {contact.email && (
                              <div className="flex items-center">
                                <Mail className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center">
                                <Phone className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{contact.company || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Badge 
                              variant={
                                contact.leadStage === 'qualified' 
                                  ? 'default'
                                  : contact.leadStage === 'contacted' 
                                  ? 'secondary'
                                  : contact.leadStage === 'proposal' 
                                  ? 'outline'
                                  : contact.leadStage === 'won' 
                                  ? 'success'
                                  : contact.leadStage === 'lost' 
                                  ? 'destructive'
                                  : 'outline'
                              }
                              className="capitalize"
                            >
                              {contact.leadStage}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{contact.source}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteContact(contact.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send SMS
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && contacts.length > pageSize && (
            <div className={`flex justify-center mt-4 ${isMobile ? 'flex-col space-y-2 items-center' : 'space-x-2'}`}>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={isMobile ? 'flex-1' : ''}
                >
                  Previous
                </Button>
                <span className="py-2 px-3 bg-secondary text-secondary-foreground rounded-md text-sm flex items-center justify-center">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={isMobile ? 'flex-1' : ''}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className={`${isMobile ? 'w-[95%] max-w-md p-4 sm:p-6' : 'max-w-2xl'} max-h-[85vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>{selectedContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {selectedContact
                ? 'Update the contact information below.'
                : 'Fill out the form below to add a new contact.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 py-4`}>
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">
                  Company
                </label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="preferredContact" className="block text-sm font-medium mb-1">
                  Preferred Contact Method
                </label>
                <Select 
                  value={formData.preferredContact} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContact: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="leadStage" className="block text-sm font-medium mb-1">
                  Lead Stage
                </label>
                <Select 
                  value={formData.leadStage} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, leadStage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="source" className="block text-sm font-medium mb-1">
                  Source
                </label>
                <Select 
                  value={formData.source} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="form">Contact Form</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  City
                </label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                    Zip Code
                  </label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="Zip code"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="e.g. VIP, Residential, Repeat customer"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes about this contact"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter className={`mt-6 ${isMobile ? 'flex-col space-y-3' : 'flex justify-between'}`}>
              <div className={`${isMobile ? 'w-full flex space-x-2' : 'flex'}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsContactDialogOpen(false)}
                  className={`${isMobile ? 'flex-1' : 'min-w-[120px]'}`}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createContactMutation.isPending || updateContactMutation.isPending}
                  className={`${isMobile ? 'flex-1' : 'min-w-[120px]'} font-semibold`}
                >
                  {(createContactMutation.isPending || updateContactMutation.isPending) && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {selectedContact ? 'Save Changes' : 'Create Contact'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ContactsPage;