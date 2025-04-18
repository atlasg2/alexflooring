import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { SmsTemplate } from '@shared/schema';

const SmsTemplatesPage = () => {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
  
  // Form state for new/edit template
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'general',
    isActive: true
  });
  
  // Character counter
  const characterCount = formData.content.length;
  const maxCharacters = 160;
  const isOverLimit = characterCount > maxCharacters;
  
  // Get templates query
  const { data: templates = [], isLoading } = useQuery<SmsTemplate[]>({
    queryKey: ['/api/admin/sms-templates'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: Omit<SmsTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/admin/sms-templates', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sms-templates'] });
      toast({
        title: 'Template created',
        description: 'The SMS template was created successfully',
      });
      setIsTemplateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<SmsTemplate> }) => {
      const response = await apiRequest('PUT', `/api/admin/sms-templates/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sms-templates'] });
      toast({
        title: 'Template updated',
        description: 'The SMS template was updated successfully',
      });
      setIsTemplateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/sms-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sms-templates'] });
      toast({
        title: 'Template deleted',
        description: 'The SMS template was deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      category: 'general',
      isActive: true
    });
    setSelectedTemplate(null);
  };
  
  // Predefined SMS templates for common scenarios
  const defaultTemplates = [
    {
      name: 'Google Review Request',
      content: `Thanks for choosing APS Flooring! We'd love your feedback. Please leave a review: {{review_link}} - Your opinion helps us improve!`,
      category: 'review',
      isActive: true
    },
    {
      name: 'Appointment Reminder',
      content: `Reminder: Your APS Flooring appointment is tomorrow at {{appointment_time}}. Call (555) 123-4567 if you need to reschedule.`,
      category: 'appointment',
      isActive: true
    },
    {
      name: 'New Lead Response',
      content: `Thanks for your interest in APS Flooring! We've received your inquiry and will contact you shortly. Questions? Call (555) 123-4567.`,
      category: 'lead',
      isActive: true
    },
    {
      name: 'Service Follow-up',
      content: `How are you enjoying your new floors from APS Flooring? Let us know if you have any questions about maintenance or care!`,
      category: 'follow-up',
      isActive: true
    }
  ];
  
  // Create default templates
  const createDefaultTemplatesMutation = useMutation({
    mutationFn: async () => {
      // Create templates sequentially to avoid race conditions
      for (const template of defaultTemplates) {
        await apiRequest('POST', '/api/admin/sms-templates', template);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sms-templates'] });
      toast({
        title: 'Default templates created',
        description: 'The predefined SMS templates were created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create default templates: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle creating default templates
  const handleCreateDefaultTemplates = () => {
    if (window.confirm('This will create 4 predefined SMS templates. Continue?')) {
      createDefaultTemplatesMutation.mutate();
    }
  };
  
  // Open dialog for new template
  const handleAddTemplate = () => {
    resetForm();
    setIsTemplateDialogOpen(true);
  };
  
  // Open dialog for editing template
  const handleEditTemplate = (template: SmsTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
      isActive: template.isActive
    });
    setIsTemplateDialogOpen(true);
  };
  
  // Handle delete template
  const handleDeleteTemplate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
    }
  };
  
  // Copy template content
  const handleCopyTemplate = (template: SmsTemplate) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: 'Copied to clipboard',
      description: 'Template content copied to clipboard',
    });
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isOverLimit) {
      toast({
        title: 'Content too long',
        description: `SMS content must be ${maxCharacters} characters or less.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedTemplate) {
      updateTemplateMutation.mutate({ 
        id: selectedTemplate.id, 
        data: formData
      });
    } else {
      createTemplateMutation.mutate(formData as any);
    }
  };
  
  return (
    <AdminLayout title="SMS Templates">
      <Card className="shadow-sm">
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">SMS Templates</CardTitle>
            <CardDescription>
              Create and manage templates for SMS messages
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {templates.length === 0 && (
              <Button 
                variant="outline" 
                onClick={handleCreateDefaultTemplates}
                disabled={createDefaultTemplatesMutation.isPending}
              >
                {createDefaultTemplatesMutation.isPending && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Create Default Templates
              </Button>
            )}
            <Button onClick={handleAddTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
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
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No SMS templates found</p>
              <p className="text-muted-foreground">You don't have any templates yet.</p>
              <Button onClick={handleAddTemplate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create your first template
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <p className="line-clamp-1 text-sm">
                          {template.content}
                        </p>
                      </TableCell>
                      <TableCell className="capitalize">{template.category}</TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyTemplate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Content
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Edit SMS Template' : 'Add New SMS Template'}</DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? 'Update the template information below.'
                : 'Fill out the form below to create a new SMS template.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Template name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="quote">Quote</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="review">Review Request</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="content" className="block text-sm font-medium">
                    SMS Content <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${isOverLimit ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                    {characterCount}/{maxCharacters} characters
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Use {'{name}'} to insert the contact's name, {'{date}'} for dates
                </p>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your SMS content here..."
                  value={formData.content}
                  onChange={handleChange}
                  rows={3}
                  required
                  className={isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {isOverLimit && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    SMS content is too long. Standard SMS messages are limited to {maxCharacters} characters.
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleCheckboxChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Template is active
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending || isOverLimit}
              >
                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SmsTemplatesPage;