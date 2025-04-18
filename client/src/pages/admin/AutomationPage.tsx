import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Play, Trash, Edit } from 'lucide-react';

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [actions, setActions] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: '',
    triggerCondition: '',
    emailTemplateId: null,
    smsTemplateId: null,
    delay: 0,
    trigger: '',
    actions: [],
    isActive: true
  });
  
  const [actionFormData, setActionFormData] = useState({
    type: '',
    data: {}
  });
  
  useEffect(() => {
    fetchWorkflows();
    fetchTriggers();
    fetchActions();
    fetchTemplates();
  }, []);
  
  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/workflows');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: 'Failed to fetch workflows',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTriggers = async () => {
    try {
      const response = await fetch('/api/admin/workflows/triggers');
      const data = await response.json();
      setTriggers(data);
    } catch (error) {
      console.error('Error fetching triggers:', error);
    }
  };
  
  const fetchActions = async () => {
    try {
      const response = await fetch('/api/admin/workflows/actions');
      const data = await response.json();
      setActions(data);
    } catch (error) {
      console.error('Error fetching actions:', error);
    }
  };
  
  const fetchTemplates = async () => {
    try {
      // Fetch email templates
      const emailResponse = await fetch('/api/admin/email-templates');
      const emailData = await emailResponse.json();
      setEmailTemplates(emailData);
      
      // Fetch SMS templates
      const smsResponse = await fetch('/api/admin/sms-templates');
      const smsData = await smsResponse.json();
      setSmsTemplates(smsData);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    
    // If we selected a trigger type, set the legacy trigger field as well
    if (name === 'triggerType') {
      setFormData(prev => ({ ...prev, triggerType: value, trigger: value }));
    }
  };
  
  const handleSwitchChange = (name, checked) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleActionInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('data.')) {
      const dataKey = name.split('.')[1];
      setActionFormData({
        ...actionFormData,
        data: {
          ...actionFormData.data,
          [dataKey]: value
        }
      });
    } else {
      setActionFormData({ ...actionFormData, [name]: value });
    }
  };
  
  const handleActionSelectChange = (name, value) => {
    if (name.startsWith('data.')) {
      const dataKey = name.split('.')[1];
      setActionFormData({
        ...actionFormData,
        data: {
          ...actionFormData.data,
          [dataKey]: value
        }
      });
    } else {
      setActionFormData({ ...actionFormData, [name]: value });
      
      // Reset data when changing action type
      if (name === 'type') {
        setActionFormData(prev => ({ ...prev, data: {} }));
      }
    }
  };
  
  const addAction = () => {
    // Basic validation
    if (!actionFormData.type) {
      toast({
        title: 'Action type required',
        description: 'Please select an action type',
        variant: 'destructive'
      });
      return;
    }
    
    // More validation depending on action type
    if (actionFormData.type === 'send_email') {
      if (!actionFormData.data.recipientEmail && !actionFormData.data.templateId) {
        toast({
          title: 'Email information required',
          description: 'Please provide either an email template or recipient information',
          variant: 'destructive'
        });
        return;
      }
    }
    
    const updatedActions = [...formData.actions, actionFormData];
    setFormData({ ...formData, actions: updatedActions });
    
    // Reset action form
    setActionFormData({ type: '', data: {} });
  };
  
  const removeAction = (index) => {
    const updatedActions = formData.actions.filter((_, i) => i !== index);
    setFormData({ ...formData, actions: updatedActions });
  };
  
  const handleCreateWorkflow = async () => {
    try {
      // Basic validation
      if (!formData.name || !formData.triggerType) {
        toast({
          title: 'Missing required fields',
          description: 'Name and trigger type are required',
          variant: 'destructive'
        });
        return;
      }
      
      const response = await fetch('/api/admin/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }
      
      await fetchWorkflows();
      setCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: 'Workflow created',
        description: 'The workflow has been created successfully'
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: 'Failed to create workflow',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdateWorkflow = async () => {
    try {
      if (!selectedWorkflow) return;
      
      const response = await fetch(`/api/admin/workflows/${selectedWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }
      
      await fetchWorkflows();
      setEditDialogOpen(false);
      resetForm();
      
      toast({
        title: 'Workflow updated',
        description: 'The workflow has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: 'Failed to update workflow',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteWorkflow = async (id) => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/admin/workflows/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }
      
      await fetchWorkflows();
      
      toast({
        title: 'Workflow deleted',
        description: 'The workflow has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Failed to delete workflow',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleToggleWorkflow = async (id, isActive) => {
    try {
      const response = await fetch(`/api/admin/workflows/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle workflow');
      }
      
      await fetchWorkflows();
      
      toast({
        title: `Workflow ${isActive ? 'disabled' : 'enabled'}`,
        description: `The workflow has been ${isActive ? 'disabled' : 'enabled'} successfully`
      });
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast({
        title: 'Failed to toggle workflow',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  };
  
  const handleRunWorkflow = async (id) => {
    try {
      setIsRunning(true);
      
      // Sample test data - in a real app, you might prompt the user for this
      const testData = {
        customerId: 1,
        contactId: 1,
        estimateId: 1,
        contractId: 1,
        customerName: 'Test Customer',
        projectTitle: 'Test Project',
        estimateNumber: 'EST-2025-0001',
        estimateTotal: '1000.00',
        contractTitle: 'Test Contract',
        contractDescription: 'Description of test contract',
        flooringDetails: 'Hardwood',
        contractAmount: '1000.00',
        appUrl: 'https://apsflooring.info'
      };
      
      const response = await fetch(`/api/admin/workflows/${id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to run workflow');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Workflow executed',
        description: `The workflow was executed successfully: ${JSON.stringify(result.results)}`
      });
    } catch (error) {
      console.error('Error running workflow:', error);
      toast({
        title: 'Failed to run workflow',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      triggerType: workflow.triggerType,
      triggerCondition: workflow.triggerCondition || '',
      emailTemplateId: workflow.emailTemplateId,
      smsTemplateId: workflow.smsTemplateId,
      delay: workflow.delay || 0,
      trigger: workflow.trigger,
      actions: workflow.actions || [],
      isActive: workflow.isActive
    });
    setEditDialogOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      triggerType: '',
      triggerCondition: '',
      emailTemplateId: null,
      smsTemplateId: null,
      delay: 0,
      trigger: '',
      actions: [],
      isActive: true
    });
    setActionFormData({ type: '', data: {} });
    setSelectedWorkflow(null);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-muted-foreground">
            Create and manage automated workflows
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                resetForm();
                setCreateDialogOpen(true);
              }}
            >
              <PlusCircle size={18} />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Define an automated workflow to respond to events
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="E.g., Send welcome email" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select 
                    value={formData.triggerType} 
                    onValueChange={(value) => handleSelectChange('triggerType', value)}
                  >
                    <SelectTrigger id="triggerType">
                      <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Choose a trigger event</SelectLabel>
                        {triggers.map(trigger => (
                          <SelectItem key={trigger.name} value={trigger.type}>
                            {trigger.description}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Describe what this workflow does" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="triggerCondition">Trigger Condition (Optional)</Label>
                  <Input 
                    id="triggerCondition" 
                    name="triggerCondition" 
                    value={formData.triggerCondition} 
                    onChange={handleInputChange} 
                    placeholder="E.g., approved" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Specific condition to match, like a status
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (Hours)</Label>
                  <Input 
                    id="delay" 
                    name="delay" 
                    type="number" 
                    min="0" 
                    value={formData.delay} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to wait before executing actions
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Workflow Active</Label>
                  <Switch 
                    id="isActive" 
                    checked={formData.isActive} 
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)} 
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only active workflows will be executed
                </p>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Actions</h3>
                  <Badge variant="outline">{formData.actions.length} actions</Badge>
                </div>
                
                {formData.actions.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <ul className="space-y-4">
                        {formData.actions.map((action, index) => (
                          <li key={index} className="flex items-start justify-between border-b pb-2">
                            <div>
                              <div className="font-medium">{action.type}</div>
                              <div className="text-sm text-muted-foreground">
                                {action.type === 'send_email' && (
                                  action.data.templateId 
                                    ? `Using template ID: ${action.data.templateId}` 
                                    : `To: ${action.data.recipientEmail}`
                                )}
                                {action.type === 'create_customer_account' && (
                                  `For contact ID: ${action.data.contactId}`
                                )}
                                {action.type === 'create_project' && (
                                  `Project: ${action.data.title || 'from contract'}`
                                )}
                                {action.type === 'convert_to_contract' && (
                                  `From estimate ID: ${action.data.estimateId}`
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeAction(index)}
                            >
                              <Trash size={16} />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Add Action</CardTitle>
                    <CardDescription>
                      Define what should happen when the workflow is triggered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="actionType">Action Type</Label>
                        <Select 
                          value={actionFormData.type} 
                          onValueChange={(value) => handleActionSelectChange('type', value)}
                        >
                          <SelectTrigger id="actionType">
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Choose an action</SelectLabel>
                              {actions.map(action => (
                                <SelectItem key={action.name} value={action.type}>
                                  {action.description}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {actionFormData.type === 'send_email' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="templateId">Email Template (Optional)</Label>
                              <Select 
                                value={actionFormData.data.templateId} 
                                onValueChange={(value) => handleActionSelectChange('data.templateId', value)}
                              >
                                <SelectTrigger id="templateId">
                                  <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Email Templates</SelectLabel>
                                    {emailTemplates.map(template => (
                                      <SelectItem key={template.id} value={template.id.toString()}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="recipientEmail">Recipient Email (or Variable)</Label>
                              <Input 
                                id="recipientEmail" 
                                name="data.recipientEmail" 
                                value={actionFormData.data.recipientEmail || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="customer@example.com or {{email}}" 
                              />
                            </div>
                          </div>
                          
                          {!actionFormData.data.templateId && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="customSubject">Email Subject</Label>
                                <Input 
                                  id="customSubject" 
                                  name="data.customSubject" 
                                  value={actionFormData.data.customSubject || ''} 
                                  onChange={handleActionInputChange} 
                                  placeholder="Your subject line" 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="customBody">Email Body (HTML)</Label>
                                <Textarea 
                                  id="customBody" 
                                  name="data.customBody" 
                                  value={actionFormData.data.customBody || ''} 
                                  onChange={handleActionInputChange} 
                                  placeholder="<p>Your email content</p>" 
                                  rows={5}
                                />
                              </div>
                            </>
                          )}
                          
                          <div className="space-y-2">
                            <Label>Template Variables (Optional)</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                              Add key-value pairs for template variables
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Input 
                                name="data.variableKey" 
                                value={actionFormData.data.variableKey || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="Variable name (e.g., name)" 
                              />
                              <Input 
                                name="data.variableValue" 
                                value={actionFormData.data.variableValue || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="Value or {{placeholder}}" 
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (!actionFormData.data.variableKey) return;
                                
                                const variables = actionFormData.data.variables || {};
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    variables: {
                                      ...variables,
                                      [actionFormData.data.variableKey]: actionFormData.data.variableValue || ''
                                    },
                                    variableKey: '',
                                    variableValue: ''
                                  }
                                });
                              }}
                            >
                              Add Variable
                            </Button>
                            
                            {actionFormData.data.variables && Object.keys(actionFormData.data.variables).length > 0 && (
                              <div className="mt-2">
                                <Label>Added Variables:</Label>
                                <ul className="text-xs mt-1">
                                  {Object.entries(actionFormData.data.variables).map(([key, value]) => (
                                    <li key={key} className="text-muted-foreground">
                                      {key}: {value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {actionFormData.type === 'create_customer_account' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactId">Contact ID</Label>
                            <Input 
                              id="contactId" 
                              name="data.contactId" 
                              value={actionFormData.data.contactId || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="1 or {{contactId}}" 
                            />
                            <p className="text-xs text-muted-foreground">
                              The contact to create an account for
                            </p>
                          </div>
                          <div className="space-y-2 flex items-center gap-2">
                            <Switch 
                              id="sendWelcomeEmail" 
                              checked={actionFormData.data.sendWelcomeEmail !== false} 
                              onCheckedChange={(checked) => {
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    sendWelcomeEmail: checked
                                  }
                                });
                              }} 
                            />
                            <Label htmlFor="sendWelcomeEmail">Send welcome email</Label>
                          </div>
                        </div>
                      )}
                      
                      {actionFormData.type === 'create_project' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="projectCustomerId">Customer ID</Label>
                              <Input 
                                id="projectCustomerId" 
                                name="data.customerId" 
                                value={actionFormData.data.customerId || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="1 or {{customerUserId}}" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="projectContactId">Contact ID (Optional)</Label>
                              <Input 
                                id="projectContactId" 
                                name="data.contactId" 
                                value={actionFormData.data.contactId || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="1 or {{contactId}}" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="projectTitle">Project Title</Label>
                            <Input 
                              id="projectTitle" 
                              name="data.title" 
                              value={actionFormData.data.title || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="Project title or {{contractTitle}}" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="projectDescription">Description (Optional)</Label>
                            <Textarea 
                              id="projectDescription" 
                              name="data.description" 
                              value={actionFormData.data.description || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="Project description or {{contractDescription}}" 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="flooringType">Flooring Type (Optional)</Label>
                              <Input 
                                id="flooringType" 
                                name="data.flooringType" 
                                value={actionFormData.data.flooringType || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="Hardwood or {{flooringType}}" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="estimatedCost">Estimated Cost (Optional)</Label>
                              <Input 
                                id="estimatedCost" 
                                name="data.estimatedCost" 
                                value={actionFormData.data.estimatedCost || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="1000.00 or {{contractAmount}}" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2 flex items-center gap-2">
                            <Switch 
                              id="notifyCustomer" 
                              checked={actionFormData.data.notifyCustomer !== false} 
                              onCheckedChange={(checked) => {
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    notifyCustomer: checked
                                  }
                                });
                              }} 
                            />
                            <Label htmlFor="notifyCustomer">Notify customer</Label>
                          </div>
                        </div>
                      )}
                      
                      {actionFormData.type === 'convert_to_contract' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="estimateId">Estimate ID</Label>
                            <Input 
                              id="estimateId" 
                              name="data.estimateId" 
                              value={actionFormData.data.estimateId || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="1 or {{estimateId}}" 
                            />
                          </div>
                          <div className="space-y-2 flex items-center gap-2">
                            <Switch 
                              id="sendToCustomer" 
                              checked={actionFormData.data.sendToCustomer === true} 
                              onCheckedChange={(checked) => {
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    sendToCustomer: checked
                                  }
                                });
                              }} 
                            />
                            <Label htmlFor="sendToCustomer">Send to customer immediately</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button 
                      type="button" 
                      onClick={addAction}
                      disabled={!actionFormData.type}
                    >
                      Add Action
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Workflow</DialogTitle>
              <DialogDescription>
                Update the workflow configuration
              </DialogDescription>
            </DialogHeader>
            
            {/* Same form as create dialog */}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="E.g., Send welcome email" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select 
                    value={formData.triggerType} 
                    onValueChange={(value) => handleSelectChange('triggerType', value)}
                  >
                    <SelectTrigger id="triggerType">
                      <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Choose a trigger event</SelectLabel>
                        {triggers.map(trigger => (
                          <SelectItem key={trigger.name} value={trigger.type}>
                            {trigger.description}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Describe what this workflow does" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="triggerCondition">Trigger Condition (Optional)</Label>
                  <Input 
                    id="triggerCondition" 
                    name="triggerCondition" 
                    value={formData.triggerCondition} 
                    onChange={handleInputChange} 
                    placeholder="E.g., approved" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Specific condition to match, like a status
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (Hours)</Label>
                  <Input 
                    id="delay" 
                    name="delay" 
                    type="number" 
                    min="0" 
                    value={formData.delay} 
                    onChange={handleInputChange} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to wait before executing actions
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Workflow Active</Label>
                  <Switch 
                    id="isActive" 
                    checked={formData.isActive} 
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)} 
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only active workflows will be executed
                </p>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Actions</h3>
                  <Badge variant="outline">{formData.actions.length} actions</Badge>
                </div>
                
                {formData.actions.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <ul className="space-y-4">
                        {formData.actions.map((action, index) => (
                          <li key={index} className="flex items-start justify-between border-b pb-2">
                            <div>
                              <div className="font-medium">{action.type}</div>
                              <div className="text-sm text-muted-foreground">
                                {action.type === 'send_email' && (
                                  action.data.templateId 
                                    ? `Using template ID: ${action.data.templateId}` 
                                    : `To: ${action.data.recipientEmail}`
                                )}
                                {action.type === 'create_customer_account' && (
                                  `For contact ID: ${action.data.contactId}`
                                )}
                                {action.type === 'create_project' && (
                                  `Project: ${action.data.title || 'from contract'}`
                                )}
                                {action.type === 'convert_to_contract' && (
                                  `From estimate ID: ${action.data.estimateId}`
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeAction(index)}
                            >
                              <Trash size={16} />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Add Action</CardTitle>
                    <CardDescription>
                      Define what should happen when the workflow is triggered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="actionType">Action Type</Label>
                        <Select 
                          value={actionFormData.type} 
                          onValueChange={(value) => handleActionSelectChange('type', value)}
                        >
                          <SelectTrigger id="actionType">
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Choose an action</SelectLabel>
                              {actions.map(action => (
                                <SelectItem key={action.name} value={action.type}>
                                  {action.description}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {actionFormData.type === 'send_email' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="templateId">Email Template (Optional)</Label>
                              <Select 
                                value={actionFormData.data.templateId} 
                                onValueChange={(value) => handleActionSelectChange('data.templateId', value)}
                              >
                                <SelectTrigger id="templateId">
                                  <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Email Templates</SelectLabel>
                                    {emailTemplates.map(template => (
                                      <SelectItem key={template.id} value={template.id.toString()}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="recipientEmail">Recipient Email (or Variable)</Label>
                              <Input 
                                id="recipientEmail" 
                                name="data.recipientEmail" 
                                value={actionFormData.data.recipientEmail || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="customer@example.com or {{email}}" 
                              />
                            </div>
                          </div>
                          
                          {!actionFormData.data.templateId && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="customSubject">Email Subject</Label>
                                <Input 
                                  id="customSubject" 
                                  name="data.customSubject" 
                                  value={actionFormData.data.customSubject || ''} 
                                  onChange={handleActionInputChange} 
                                  placeholder="Your subject line" 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="customBody">Email Body (HTML)</Label>
                                <Textarea 
                                  id="customBody" 
                                  name="data.customBody" 
                                  value={actionFormData.data.customBody || ''} 
                                  onChange={handleActionInputChange} 
                                  placeholder="<p>Your email content</p>" 
                                  rows={5}
                                />
                              </div>
                            </>
                          )}
                          
                          <div className="space-y-2">
                            <Label>Template Variables (Optional)</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                              Add key-value pairs for template variables
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Input 
                                name="data.variableKey" 
                                value={actionFormData.data.variableKey || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="Variable name (e.g., name)" 
                              />
                              <Input 
                                name="data.variableValue" 
                                value={actionFormData.data.variableValue || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="Value or {{placeholder}}" 
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (!actionFormData.data.variableKey) return;
                                
                                const variables = actionFormData.data.variables || {};
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    variables: {
                                      ...variables,
                                      [actionFormData.data.variableKey]: actionFormData.data.variableValue || ''
                                    },
                                    variableKey: '',
                                    variableValue: ''
                                  }
                                });
                              }}
                            >
                              Add Variable
                            </Button>
                            
                            {actionFormData.data.variables && Object.keys(actionFormData.data.variables).length > 0 && (
                              <div className="mt-2">
                                <Label>Added Variables:</Label>
                                <ul className="text-xs mt-1">
                                  {Object.entries(actionFormData.data.variables).map(([key, value]) => (
                                    <li key={key} className="text-muted-foreground">
                                      {key}: {value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {actionFormData.type === 'create_customer_account' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactId">Contact ID</Label>
                            <Input 
                              id="contactId" 
                              name="data.contactId" 
                              value={actionFormData.data.contactId || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="1 or {{contactId}}" 
                            />
                            <p className="text-xs text-muted-foreground">
                              The contact to create an account for
                            </p>
                          </div>
                          <div className="space-y-2 flex items-center gap-2">
                            <Switch 
                              id="sendWelcomeEmail" 
                              checked={actionFormData.data.sendWelcomeEmail !== false} 
                              onCheckedChange={(checked) => {
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    sendWelcomeEmail: checked
                                  }
                                });
                              }} 
                            />
                            <Label htmlFor="sendWelcomeEmail">Send welcome email</Label>
                          </div>
                        </div>
                      )}
                      
                      {actionFormData.type === 'create_project' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="projectCustomerId">Customer ID</Label>
                              <Input 
                                id="projectCustomerId" 
                                name="data.customerId" 
                                value={actionFormData.data.customerId || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="1 or {{customerUserId}}" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="projectContactId">Contact ID (Optional)</Label>
                              <Input 
                                id="projectContactId" 
                                name="data.contactId" 
                                value={actionFormData.data.contactId || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="1 or {{contactId}}" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="projectTitle">Project Title</Label>
                            <Input 
                              id="projectTitle" 
                              name="data.title" 
                              value={actionFormData.data.title || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="Project title or {{contractTitle}}" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="projectDescription">Description (Optional)</Label>
                            <Textarea 
                              id="projectDescription" 
                              name="data.description" 
                              value={actionFormData.data.description || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="Project description or {{contractDescription}}" 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="flooringType">Flooring Type (Optional)</Label>
                              <Input 
                                id="flooringType" 
                                name="data.flooringType" 
                                value={actionFormData.data.flooringType || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="Hardwood or {{flooringType}}" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="estimatedCost">Estimated Cost (Optional)</Label>
                              <Input 
                                id="estimatedCost" 
                                name="data.estimatedCost" 
                                value={actionFormData.data.estimatedCost || ''} 
                                onChange={handleActionInputChange} 
                                placeholder="1000.00 or {{contractAmount}}" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2 flex items-center gap-2">
                            <Switch 
                              id="notifyCustomer" 
                              checked={actionFormData.data.notifyCustomer !== false} 
                              onCheckedChange={(checked) => {
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    notifyCustomer: checked
                                  }
                                });
                              }} 
                            />
                            <Label htmlFor="notifyCustomer">Notify customer</Label>
                          </div>
                        </div>
                      )}
                      
                      {actionFormData.type === 'convert_to_contract' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="estimateId">Estimate ID</Label>
                            <Input 
                              id="estimateId" 
                              name="data.estimateId" 
                              value={actionFormData.data.estimateId || ''} 
                              onChange={handleActionInputChange} 
                              placeholder="1 or {{estimateId}}" 
                            />
                          </div>
                          <div className="space-y-2 flex items-center gap-2">
                            <Switch 
                              id="sendToCustomer" 
                              checked={actionFormData.data.sendToCustomer === true} 
                              onCheckedChange={(checked) => {
                                setActionFormData({
                                  ...actionFormData,
                                  data: {
                                    ...actionFormData.data,
                                    sendToCustomer: checked
                                  }
                                });
                              }} 
                            />
                            <Label htmlFor="sendToCustomer">Send to customer immediately</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button 
                      type="button" 
                      onClick={addAction}
                      disabled={!actionFormData.type}
                    >
                      Add Action
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateWorkflow}>Update Workflow</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Workflow Automation</CardTitle>
          <CardDescription>
            Configure automated workflows that run when specific events happen in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {isLoading ? 'Loading workflows...' : (
                workflows.length === 0 ? 'No workflows found' : `Total ${workflows.length} workflows`
              )}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading workflows...
                  </TableCell>
                </TableRow>
              ) : workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No workflows found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">
                      {workflow.name}
                      {workflow.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {workflow.description.substring(0, 60)}
                          {workflow.description.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {triggers.find(t => t.type === workflow.triggerType)?.description || workflow.triggerType}
                    </TableCell>
                    <TableCell>
                      {workflow.triggerCondition || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {Array.isArray(workflow.actions) 
                          ? workflow.actions.length 
                          : (typeof workflow.actions === 'object' && workflow.actions ? 1 : 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {workflow.delay > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {workflow.delay}h delay
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Toggle active status"
                          onClick={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
                        >
                          {workflow.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Run workflow manually"
                          onClick={() => handleRunWorkflow(workflow.id)}
                          disabled={isRunning}
                        >
                          <Play size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Edit workflow"
                          onClick={() => handleEditWorkflow(workflow)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Delete workflow"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          disabled={isDeleting}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}