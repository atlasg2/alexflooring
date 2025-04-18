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
  Mail
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { EmailTemplate } from '@shared/schema';

const EmailTemplatesPage = () => {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  // Form state for new/edit template
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    isActive: true
  });
  
  // Get templates query
  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/admin/email-templates'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/admin/email-templates', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: 'Template created',
        description: 'The email template was created successfully',
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
    mutationFn: async ({ id, data }: { id: number, data: Partial<EmailTemplate> }) => {
      const response = await apiRequest('PUT', `/api/admin/email-templates/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: 'Template updated',
        description: 'The email template was updated successfully',
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
      await apiRequest('DELETE', `/api/admin/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: 'Template deleted',
        description: 'The email template was deleted successfully',
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
      subject: '',
      body: '',
      category: 'general',
      isActive: true
    });
    setSelectedTemplate(null);
  };
  
  // Predefined email templates for common scenarios
  const defaultTemplates = [
    // Review Requests
    {
      name: 'Google Review Request',
      subject: 'We Would Love Your Feedback on APS Flooring Service',
      body: `Dear {{customer_name}},

Thank you for choosing APS Flooring for your recent {{project_type}} project. We hope you're enjoying your new floors!

We value your feedback and would appreciate if you could take a moment to share your experience with us on Google. Your review helps us improve our service and helps others discover quality flooring solutions.

You can leave a review by clicking the link below:
{{review_link}}

Thank you for your time and for trusting APS Flooring with your home improvement project.

Best regards,
APS Flooring Team
(504) 402-3895
www.apsflooring.com`,
      category: 'review',
      isActive: true
    },
    
    // Appointment Templates
    {
      name: 'Appointment Confirmation',
      subject: 'Your APS Flooring Appointment Confirmation',
      body: `Dear {{customer_name}},

Thank you for scheduling an appointment with APS Flooring. We're confirming your appointment:

Date: {{appointment_date}}
Time: {{appointment_time}}
Location: {{customer_address}}
Purpose: {{appointment_purpose}}

What to expect:
- Our team will arrive in a company vehicle
- The appointment will take approximately {{appointment_duration}}
- We'll discuss your flooring needs and provide professional recommendations

If you need to reschedule or have any questions, please call us at (504) 402-3895.

We look forward to helping you create the perfect flooring for your space!

Best regards,
APS Flooring Team
www.apsflooring.com`,
      category: 'appointment',
      isActive: true
    },
    {
      name: 'Appointment Reminder',
      subject: 'Reminder: Your APS Flooring Appointment Tomorrow',
      body: `Dear {{customer_name}},

This is a friendly reminder about your scheduled appointment with APS Flooring tomorrow at {{appointment_time}}.

Our team will arrive at {{customer_address}} to {{appointment_purpose}}.

If you need to reschedule or have any questions, please call us at (504) 402-3895.

We look forward to seeing you!

Best regards,
APS Flooring Team
www.apsflooring.com`,
      category: 'appointment',
      isActive: true
    },
    
    // Lead Management Templates
    {
      name: 'Welcome New Lead',
      subject: 'Welcome to APS Flooring - Louisiana\'s Premier Flooring Solution',
      body: `Dear {{customer_name}},

Thank you for your interest in APS Flooring! We're excited to help you with your flooring project.

At APS Flooring, we specialize in providing high-quality flooring solutions for residential and commercial properties throughout Louisiana. Our team of experts is committed to delivering exceptional service and craftsmanship.

Here's what you can expect from us:
• Professional consultation to understand your specific needs
• Quality materials and installation techniques
• Transparent pricing and timelines
• Ongoing support and maintenance advice

We'll be reaching out to you shortly to discuss your project in more detail. In the meantime, feel free to browse our website at www.apsflooring.com to explore our services and previous projects.

If you have any immediate questions, don't hesitate to contact us at (504) 402-3895.

We look forward to working with you!

Best regards,
APS Flooring Team
www.apsflooring.com`,
      category: 'lead',
      isActive: true
    },
    {
      name: 'Quote Follow-Up',
      subject: 'Your APS Flooring Quote',
      body: `Dear {{customer_name}},

Thank you for the opportunity to provide a quote for your flooring project. Based on our discussion and assessment, we're pleased to provide the following estimate:

Project: {{project_description}}
Material: {{material_type}}
Area: {{project_area}}
Estimated Cost: {{quote_amount}}
Estimated Timeline: {{project_timeline}}

This quote includes:
• All materials as discussed
• Professional installation
• Cleanup and removal of old flooring
• {{warranty_details}}

The quote is valid for 30 days from today. To proceed with your project, simply reply to this email or call us at (504) 402-3895 to schedule the installation.

If you have any questions or would like to discuss adjustments to the scope of work, please don't hesitate to reach out.

Best regards,
APS Flooring Team
www.apsflooring.com`,
      category: 'quote',
      isActive: true
    },
    
    // Project and Maintenance Templates
    {
      name: 'Project Start Notification',
      subject: 'Your APS Flooring Project Begins Soon',
      body: `Dear {{customer_name}},

We're excited to let you know that your flooring project is scheduled to begin on {{project_start_date}} at approximately {{project_start_time}}.

Project Details:
• Type: {{project_type}}
• Location: {{project_location}}
• Estimated Duration: {{project_duration}}

Before we arrive, please:
1. Remove small furniture and fragile items from the area
2. Ensure clear access to the rooms being worked on
3. Secure pets in a safe area away from the work zone

Our team will arrive with all necessary materials and equipment. We'll take care to protect your property during the installation process.

If you have any questions before we begin, please call us at (504) 402-3895.

We look forward to transforming your space!

Best regards,
APS Flooring Team
www.apsflooring.com`,
      category: 'project',
      isActive: true
    },
    {
      name: 'Post-Service Follow-up',
      subject: 'How Are Your New Floors from APS Flooring?',
      body: `Dear {{customer_name}},

We hope you're enjoying your new {{flooring_type}} floors from APS Flooring!

It's been a week since we completed your flooring project, and we wanted to check in to ensure everything is to your satisfaction. Your happiness with our work is our top priority.

Here are a few tips to maintain your new floors:
• {{maintenance_tip_1}}
• {{maintenance_tip_2}}
• {{maintenance_tip_3}}

Is there anything else we can assist you with? We'd love to hear your feedback or answer any questions you might have.

If you're pleased with our service, we would greatly appreciate it if you would share your experience by leaving us a review on Google: {{review_link}}

Thank you for choosing APS Flooring for your project.

Best regards,
APS Flooring Team
(504) 402-3895
www.apsflooring.com`,
      category: 'follow-up',
      isActive: true
    },
    
    // Special Promotions and Seasonal Templates
    {
      name: 'Seasonal Promotion',
      subject: 'Special Spring Flooring Sale - Save 15% on Selected Products',
      body: `Dear {{customer_name}},

Spring is the perfect time to refresh your home with new flooring, and we're excited to offer a special seasonal promotion!

🌟 SPRING FLOORING SALE 🌟
For a limited time, save 15% on all hardwood and luxury vinyl plank flooring installations.

Special Offer Details:
• 15% off all hardwood and LVP installations
• Free in-home consultation and estimate
• Promotion valid until {{promotion_end_date}}
• Must mention code: SPRING2023

This is the perfect opportunity to upgrade your home with beautiful, durable flooring from APS Flooring.

To take advantage of this offer, call us at (504) 402-3895 or reply to this email to schedule your free consultation.

Best regards,
APS Flooring Team
www.apsflooring.com

*Terms and conditions apply. Cannot be combined with other offers. Minimum project size required.`,
      category: 'promotion',
      isActive: true
    },
    {
      name: 'Customer Referral Thank You',
      subject: 'Thank You for Your Referral to APS Flooring',
      body: `Dear {{customer_name}},

We wanted to take a moment to sincerely thank you for referring {{referred_customer}} to APS Flooring. Referrals from satisfied customers like you are the highest compliment we can receive.

As a token of our appreciation, we'd like to offer you a $100 gift card to {{gift_card_vendor}} which you'll receive once your friend's project is completed.

Your trust in our work means the world to us, and we're committed to providing the same level of quality and service to everyone you refer.

If you know anyone else who might benefit from our flooring services, please don't hesitate to pass along our information. Our referral rewards program continues for each new customer you send our way!

Thank you again for your support and confidence in APS Flooring.

Best regards,
APS Flooring Team
(504) 402-3895
www.apsflooring.com`,
      category: 'referral',
      isActive: true
    }
  ];
  
  // Create default templates
  const createDefaultTemplatesMutation = useMutation({
    mutationFn: async () => {
      // Create templates sequentially to avoid race conditions
      for (const template of defaultTemplates) {
        await apiRequest('POST', '/api/admin/email-templates', template);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: 'Default templates created',
        description: 'The predefined email templates were created successfully',
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
    if (window.confirm(`This will create ${defaultTemplates.length} predefined email templates. Continue?`)) {
      createDefaultTemplatesMutation.mutate();
    }
  };
  
  // Open dialog for new template
  const handleAddTemplate = () => {
    resetForm();
    setIsTemplateDialogOpen(true);
  };
  
  // Open dialog for editing template
  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
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
  const handleCopyTemplate = (template: EmailTemplate) => {
    navigator.clipboard.writeText(template.body);
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
    <AdminLayout title="Email Templates">
      <Card className="shadow-sm">
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Email Templates</CardTitle>
            <CardDescription>
              Create and manage templates for customer communications
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
              <Mail className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No email templates found</p>
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
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
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
            <DialogTitle>{selectedTemplate ? 'Edit Email Template' : 'Add New Email Template'}</DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? 'Update the template information below.'
                : 'Fill out the form below to create a new email template.'}
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
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Email subject line"
                  value={formData.subject}
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
                <label htmlFor="body" className="block text-sm font-medium mb-1">
                  Email Content <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Use {'{name}'} to insert the contact's name, {'{date}'} for dates, and {'{company}'} for company name
                </p>
                <Textarea
                  id="body"
                  name="body"
                  placeholder="Write your email content here..."
                  value={formData.body}
                  onChange={handleChange}
                  rows={8}
                  required
                />
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
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
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

export default EmailTemplatesPage;