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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Activity,
  Play,
  Pause,
  Calendar,
  Mail,
  MessageSquare,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { AutomationWorkflow, EmailTemplate, SmsTemplate } from '@shared/schema';

const AutomationPage = () => {
  const [isAutomationDialogOpen, setIsAutomationDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationWorkflow | null>(null);
  
  // Form state for new/edit automation
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'manual',
    triggerCondition: '',
    emailTemplateId: 0,
    smsTemplateId: 0,
    delay: 0,
    isActive: true
  });
  
  // Get automation workflows query
  const { data: automations = [], isLoading } = useQuery<AutomationWorkflow[]>({
    queryKey: ['/api/admin/automation'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Get email templates for selection
  const { data: emailTemplates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/admin/email-templates'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Get SMS templates for selection
  const { data: smsTemplates = [] } = useQuery<SmsTemplate[]>({
    queryKey: ['/api/admin/sms-templates'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Create automation mutation
  const createAutomationMutation = useMutation({
    mutationFn: async (data: Omit<AutomationWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/admin/automation', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/automation'] });
      toast({
        title: 'Automation created',
        description: 'The automation workflow was created successfully',
      });
      setIsAutomationDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create automation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update automation mutation
  const updateAutomationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<AutomationWorkflow> }) => {
      const response = await apiRequest('PUT', `/api/admin/automation/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/automation'] });
      toast({
        title: 'Automation updated',
        description: 'The automation workflow was updated successfully',
      });
      setIsAutomationDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update automation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete automation mutation
  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/automation/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/automation'] });
      toast({
        title: 'Automation deleted',
        description: 'The automation workflow was deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete automation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle automation mutation
  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/automation/${id}/toggle`, { isActive });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/automation'] });
      toast({
        title: data.isActive ? 'Automation enabled' : 'Automation disabled',
        description: `The automation workflow was ${data.isActive ? 'enabled' : 'disabled'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to toggle automation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      triggerType: 'manual',
      triggerCondition: '',
      emailTemplateId: 0,
      smsTemplateId: 0,
      delay: 0,
      isActive: true
    });
    setSelectedAutomation(null);
  };
  
  // Open dialog for new automation
  const handleAddAutomation = () => {
    resetForm();
    setIsAutomationDialogOpen(true);
  };
  
  // Open dialog for editing automation
  const handleEditAutomation = (automation: AutomationWorkflow) => {
    setSelectedAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description || '',
      triggerType: automation.triggerType,
      triggerCondition: automation.triggerCondition || '',
      emailTemplateId: automation.emailTemplateId || 0,
      smsTemplateId: automation.smsTemplateId || 0,
      delay: automation.delay || 0,
      isActive: automation.isActive
    });
    setIsAutomationDialogOpen(true);
  };
  
  // Handle delete automation
  const handleDeleteAutomation = (id: number) => {
    if (window.confirm('Are you sure you want to delete this automation workflow?')) {
      deleteAutomationMutation.mutate(id);
    }
  };
  
  // Handle toggle automation
  const handleToggleAutomation = (id: number, currentStatus: boolean) => {
    toggleAutomationMutation.mutate({ id, isActive: !currentStatus });
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle numeric input changes
  const handleNumericChange = (name: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'emailTemplateId' || name === 'smsTemplateId') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Handle checkbox/switch changes
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedAutomation) {
      updateAutomationMutation.mutate({ 
        id: selectedAutomation.id, 
        data: formData
      });
    } else {
      createAutomationMutation.mutate(formData as any);
    }
  };
  
  // Helper to get trigger type description
  const getTriggerTypeDisplay = (type: string): { label: string, icon: React.ReactNode } => {
    switch (type) {
      case 'lead_stage_change':
        return { 
          label: 'Lead Stage Change', 
          icon: <Activity className="h-4 w-4 text-amber-500" /> 
        };
      case 'appointment':
        return { 
          label: 'Appointment', 
          icon: <Calendar className="h-4 w-4 text-purple-500" /> 
        };
      case 'form_submission':
        return { 
          label: 'Form Submission', 
          icon: <Mail className="h-4 w-4 text-blue-500" /> 
        };
      case 'review_request':
        return { 
          label: 'Review Request', 
          icon: <Star className="h-4 w-4 text-yellow-500" /> 
        };
      default:
        return { 
          label: 'Manual Trigger', 
          icon: <Play className="h-4 w-4 text-green-500" /> 
        };
    }
  };
  
  // Determine number of actions in a workflow
  const getActionCount = (workflow: AutomationWorkflow): number => {
    let count = 0;
    if (workflow.emailTemplateId) count++;
    if (workflow.smsTemplateId) count++;
    return count || 1; // At least 1
  };
  
  // Get email template name by ID
  const getEmailTemplateName = (id: number): string => {
    const template = emailTemplates.find(t => t.id === id);
    return template ? template.name : 'None';
  };
  
  // Get SMS template name by ID
  const getSmsTemplateName = (id: number): string => {
    const template = smsTemplates.find(t => t.id === id);
    return template ? template.name : 'None';
  };
  
  return (
    <AdminLayout title="Automation Workflows">
      <Card className="shadow-sm">
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Automation Workflows</CardTitle>
            <CardDescription>
              Create and manage automation workflows to streamline your customer communications
            </CardDescription>
          </div>
          <Button onClick={handleAddAutomation}>
            <Plus className="mr-2 h-4 w-4" />
            Add Workflow
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : automations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No automation workflows found</p>
              <p className="text-muted-foreground">You don't have any automation workflows yet.</p>
              <Button onClick={handleAddAutomation} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create your first workflow
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automations.map((automation) => {
                    const triggerInfo = getTriggerTypeDisplay(automation.triggerType);
                    return (
                      <TableRow key={automation.id}>
                        <TableCell>
                          <div className="font-medium">{automation.name}</div>
                          {automation.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {automation.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {triggerInfo.icon}
                            <span className="ml-2 capitalize">{triggerInfo.label}</span>
                          </div>
                          {automation.triggerCondition && (
                            <div className="text-xs text-muted-foreground mt-1">
                              When: {automation.triggerCondition}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {automation.emailTemplateId > 0 && (
                              <div className="flex items-center text-sm">
                                <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span>Email: {getEmailTemplateName(automation.emailTemplateId)}</span>
                              </div>
                            )}
                            {automation.smsTemplateId > 0 && (
                              <div className="flex items-center text-sm">
                                <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span>SMS: {getSmsTemplateName(automation.smsTemplateId)}</span>
                              </div>
                            )}
                            {automation.delay > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Delay: {automation.delay} {automation.delay === 1 ? 'hour' : 'hours'}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={automation.isActive ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => handleToggleAutomation(automation.id, automation.isActive)}
                          >
                            {automation.isActive ? 'Active' : 'Inactive'}
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
                              <DropdownMenuItem onClick={() => handleEditAutomation(automation)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleAutomation(automation.id, automation.isActive)}>
                                {automation.isActive ? (
                                  <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Enable
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteAutomation(automation.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Automation Dialog */}
      <Dialog open={isAutomationDialogOpen} onOpenChange={setIsAutomationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAutomation ? 'Edit Automation Workflow' : 'Create Automation Workflow'}</DialogTitle>
            <DialogDescription>
              {selectedAutomation
                ? 'Update the automation workflow below.'
                : 'Set up a new automated workflow to engage with your customers.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Workflow Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Name this workflow"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Briefly describe what this workflow does"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Trigger</h3>
                
                <div>
                  <label htmlFor="triggerType" className="block text-sm font-medium mb-1">
                    Trigger Type <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.triggerType} 
                    onValueChange={(value) => handleSelectChange('triggerType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="When should this workflow run?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Trigger</SelectItem>
                      <SelectItem value="lead_stage_change">Lead Stage Change</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="form_submission">Form Submission</SelectItem>
                      <SelectItem value="review_request">Review Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.triggerType !== 'manual' && (
                  <div className="mt-3">
                    <label htmlFor="triggerCondition" className="block text-sm font-medium mb-1">
                      Condition
                    </label>
                    <Input
                      id="triggerCondition"
                      name="triggerCondition"
                      placeholder={
                        formData.triggerType === 'lead_stage_change' 
                          ? 'e.g., When lead stage changes to "qualified"'
                          : formData.triggerType === 'appointment'
                          ? 'e.g., 1 day before appointment'
                          : 'Specify condition'
                      }
                      value={formData.triggerCondition}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Actions</h3>
                
                <div>
                  <label htmlFor="emailTemplateId" className="block text-sm font-medium mb-1">
                    Email Template
                  </label>
                  <Select 
                    value={formData.emailTemplateId.toString()} 
                    onValueChange={(value) => handleSelectChange('emailTemplateId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an email template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      {emailTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="smsTemplateId" className="block text-sm font-medium mb-1">
                    SMS Template
                  </label>
                  <Select 
                    value={formData.smsTemplateId.toString()} 
                    onValueChange={(value) => handleSelectChange('smsTemplateId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an SMS template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      {smsTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="delay" className="block text-sm font-medium mb-1">
                    Delay (hours)
                  </label>
                  <Input
                    id="delay"
                    name="delay"
                    type="number"
                    min="0"
                    placeholder="Wait this many hours before sending"
                    value={formData.delay.toString()}
                    onChange={(e) => handleNumericChange('delay', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter 0 for immediate sending
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive">
                  Enable this workflow
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAutomationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={
                  createAutomationMutation.isPending || 
                  updateAutomationMutation.isPending ||
                  (formData.emailTemplateId === 0 && formData.smsTemplateId === 0)
                }
              >
                {(createAutomationMutation.isPending || updateAutomationMutation.isPending) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {selectedAutomation ? 'Update Workflow' : 'Create Workflow'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AutomationPage;