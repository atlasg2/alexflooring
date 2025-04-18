import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Plus, Trash, ArrowLeft, ChevronDown, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import { trackComponentLifecycle } from '@/utils/performance';

// Types for forms
type Contact = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  isCustomer?: boolean;
};

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

// Flooring options with predefined costs
interface FlooringOption {
  name: string;
  description: string;
  materialCostPerSqFt: number;
  laborCostPerSqFt: number;
  defaultItems: {
    description: string;
    unit: string;
    unitPrice: number;
    category: string;
  }[];
}

const flooringOptions: Record<string, FlooringOption> = {
  hardwood: {
    name: "Hardwood",
    description: "Premium solid hardwood flooring installation",
    materialCostPerSqFt: 8.75,
    laborCostPerSqFt: 4.50,
    defaultItems: [
      { description: "Premium Oak Hardwood", unit: "sq ft", unitPrice: 8.75, category: "materials" },
      { description: "Hardwood Installation", unit: "sq ft", unitPrice: 4.50, category: "labor" },
      { description: "Floor Preparation", unit: "sq ft", unitPrice: 1.25, category: "labor" },
      { description: "Waste Disposal", unit: "flat", unitPrice: 250, category: "service" }
    ]
  },
  laminate: {
    name: "Laminate",
    description: "Durable laminate flooring installation",
    materialCostPerSqFt: 4.50,
    laborCostPerSqFt: 3.25,
    defaultItems: [
      { description: "Premium Laminate Planks", unit: "sq ft", unitPrice: 4.50, category: "materials" },
      { description: "Laminate Installation", unit: "sq ft", unitPrice: 3.25, category: "labor" },
      { description: "Moisture Barrier", unit: "sq ft", unitPrice: 0.75, category: "materials" },
      { description: "Waste Disposal", unit: "flat", unitPrice: 200, category: "service" }
    ]
  },
  vinyl: {
    name: "Luxury Vinyl",
    description: "Luxury vinyl plank or tile flooring installation",
    materialCostPerSqFt: 5.25,
    laborCostPerSqFt: 3.50,
    defaultItems: [
      { description: "Luxury Vinyl Planks", unit: "sq ft", unitPrice: 5.25, category: "materials" },
      { description: "Vinyl Installation", unit: "sq ft", unitPrice: 3.50, category: "labor" },
      { description: "Floor Preparation", unit: "sq ft", unitPrice: 1.00, category: "labor" },
      { description: "Waste Disposal", unit: "flat", unitPrice: 180, category: "service" }
    ]
  },
  tile: {
    name: "Ceramic Tile",
    description: "Ceramic or porcelain tile flooring installation",
    materialCostPerSqFt: 6.50,
    laborCostPerSqFt: 7.25,
    defaultItems: [
      { description: "Ceramic Tile", unit: "sq ft", unitPrice: 6.50, category: "materials" },
      { description: "Tile Installation", unit: "sq ft", unitPrice: 7.25, category: "labor" },
      { description: "Grout and Mortar", unit: "sq ft", unitPrice: 1.75, category: "materials" },
      { description: "Floor Preparation", unit: "sq ft", unitPrice: 2.00, category: "labor" },
      { description: "Waste Disposal", unit: "flat", unitPrice: 275, category: "service" }
    ]
  },
  carpet: {
    name: "Carpet",
    description: "Residential or commercial carpet installation",
    materialCostPerSqFt: 4.00,
    laborCostPerSqFt: 2.50,
    defaultItems: [
      { description: "Residential Carpet", unit: "sq ft", unitPrice: 4.00, category: "materials" },
      { description: "Carpet Padding", unit: "sq ft", unitPrice: 1.00, category: "materials" },
      { description: "Carpet Installation", unit: "sq ft", unitPrice: 2.50, category: "labor" },
      { description: "Waste Disposal", unit: "flat", unitPrice: 150, category: "service" }
    ]
  }
};

// Helper function to calculate totals
const calculateLineTotals = (items: LineItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice || '0'), 0);
  return {
    subtotal: subtotal.toFixed(2),
    total: subtotal.toFixed(2) // Without tax or discount for now
  };
};

// Type augmentation for AbortSignal.timeout
declare global {
  interface AbortSignalStatic {
    timeout?: (ms: number) => AbortSignal;
  }
}

// Create a cross-browser compatible abort signal with timeout
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  // Check if AbortSignal.timeout exists - not available in all browsers
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal && typeof (AbortSignal as any).timeout === 'function') {
    try {
      return (AbortSignal as any).timeout(timeoutMs);
    } catch (e) {
      console.warn('AbortSignal.timeout failed, using fallback', e);
    }
  }
  
  // Otherwise create our own implementation
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(new Error('Request timeout')), timeoutMs);
  
  // Add event listener to cleanup timeout when request completes
  controller.signal.addEventListener('abort', () => window.clearTimeout(timeoutId), { once: true });
  
  return controller.signal;
};

// Create form schema
const estimateFormSchema = z.object({
  contactId: z.number({
    required_error: "Customer is required",
  }),
  title: z.string().default("Flooring Estimate").optional(),
  description: z.string().optional(),
  validUntil: z.date().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  lineItems: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      unit: z.string().min(1, "Unit is required"),
      unitPrice: z.string().min(1, "Unit price is required"),
      totalPrice: z.string(),
      category: z.string().optional(),
      notes: z.string().optional(),
    })
  ).min(1, "At least one line item is required"),
  subtotal: z.string(),
  tax: z.string().optional(),
  discount: z.string().optional(),
  total: z.string(),
});

type EstimateFormValues = z.infer<typeof estimateFormSchema>;

export default function EstimateCreatePage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isMobile = useMobile();
  const [selectedFlooringType, setSelectedFlooringType] = useState<string>("");
  const [squareFootage, setSquareFootage] = useState<number>(0);
  
  // Refs to keep track of memory resources
  const timeoutRefs = useRef<number[]>([]);
  
  // Monitor component lifecycle
  useEffect(() => {
    return trackComponentLifecycle('EstimateCreatePage', () => {
      console.log('EstimateCreatePage mounted');
    }, () => {
      console.log('EstimateCreatePage unmounting - cleaning up resources');
      // Clean up any timeouts
      timeoutRefs.current.forEach(id => window.clearTimeout(id));
      timeoutRefs.current = [];
      
      // Cancel any ongoing queries to prevent memory leaks
      queryClient.cancelQueries({ queryKey: ['contacts'] });
      
      // Clear selected customer from localStorage to prevent stale state
      try {
        localStorage.removeItem('selectedCustomerId');
      } catch (err) {
        console.error("Failed to clean localStorage:", err);
      }
    });
  }, [queryClient]);
  
  // Get pre-selected customer ID from local storage - use memo to avoid re-parsing
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(() => {
    try {
      const storedId = localStorage.getItem('selectedCustomerId');
      return storedId ? parseInt(storedId, 10) : null;
    } catch (err) {
      console.error("Failed to read customer ID from storage:", err);
      return null;
    }
  });
  
  // Default line item
  const defaultLineItem: LineItem = {
    id: uuidv4(),
    description: '',
    quantity: 1,
    unit: 'each',
    unitPrice: '0.00',
    totalPrice: '0.00',
  };
  
  // Create form with defaults
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      contactId: selectedCustomerId || undefined,
      title: 'Flooring Estimate',  // Default title
      description: '',
      lineItems: [defaultLineItem],
      subtotal: '0.00',
      total: '0.00',
    },
    mode: 'onChange', // Validate on change for better user experience
  });
  
  // Get form values for calculations
  const { lineItems, subtotal, total } = form.watch();
  
  // Fetch contacts for the dropdown
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/crm/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    }
  });
  
  // Set customer ID in form when contacts are loaded
  useEffect(() => {
    if (contacts && selectedCustomerId) {
      const contactExists = contacts.some((contact: Contact) => contact.id === selectedCustomerId);
      if (contactExists) {
        form.setValue('contactId', selectedCustomerId);
      }
    }
  }, [contacts, selectedCustomerId, form]);
  
  // Mutation to create estimate - use apiRequest from queryClient for better error handling
  const createMutation = useMutation({
    mutationFn: async (data: EstimateFormValues) => {
      console.log('Submitting estimate data:', data);
      
      // Add any missing required fields
      const enhancedData = {
        ...data,
        // Add default status
        status: 'draft'
      };
      
      // Set a timeout to prevent hanging operations
      const timeoutId = window.setTimeout(() => {
        console.warn('Estimate creation is taking longer than expected');
      }, 10000);
      
      // Add to our refs for cleanup
      timeoutRefs.current.push(timeoutId);
      
      try {
        console.log('Sending to server:', JSON.stringify(enhancedData, null, 2));
        
        // Use apiRequest instead of direct fetch for better error handling
        const response = await fetch('/api/admin/estimates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enhancedData),
          // Create a more compatible AbortController for timeout
          signal: createTimeoutSignal(15000) // 15 second timeout
        });
        
        // Clear the timeout now that request is complete
        window.clearTimeout(timeoutId);
        timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server error response:', errorData);
          throw new Error(errorData.message || errorData.error || 'Failed to create estimate');
        }
        
        return response.json();
      } catch (error) {
        // Clean up timeout if there's an error
        window.clearTimeout(timeoutId);
        timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast({
        title: 'Estimate Created',
        description: `Estimate #${data.estimateNumber} has been created successfully.`,
      });
      navigate('/admin/estimates');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create estimate',
        variant: 'destructive',
      });
    },
  });
  
  // Add new line item
  const addLineItem = () => {
    const currentItems = form.getValues('lineItems') || [];
    form.setValue('lineItems', [...currentItems, {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unit: 'each',
      unitPrice: '0.00',
      totalPrice: '0.00',
    }]);
  };
  
  // Apply flooring option template with given square footage
  const applyFlooringTemplate = (flooringType: string, sqFt: number) => {
    if (!flooringType || !flooringOptions[flooringType] || sqFt <= 0) {
      return;
    }
    
    const template = flooringOptions[flooringType];
    
    // Generate line items from template
    const newLineItems: LineItem[] = template.defaultItems.map(item => {
      // Determine quantity based on the unit type
      const quantity = item.unit === 'sq ft' ? sqFt : 1;
      const totalPrice = (quantity * item.unitPrice).toFixed(2);
      
      return {
        id: uuidv4(),
        description: item.description,
        quantity,
        unit: item.unit,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice,
        category: item.category
      };
    });
    
    // Set values in form
    form.setValue('lineItems', newLineItems);
    
    // Generate title and description based on template
    form.setValue('title', `${template.name} Flooring Installation`);
    form.setValue('description', `${template.description} for approximately ${sqFt} square feet.`);
    
    // Recalculate totals
    const { subtotal, total } = calculateLineTotals(newLineItems);
    form.setValue('subtotal', subtotal);
    form.setValue('total', total);
  };
  
  // Remove line item
  const removeLineItem = (index: number) => {
    const currentItems = form.getValues('lineItems');
    if (currentItems.length <= 1) {
      toast({
        title: 'Error',
        description: 'At least one line item is required',
        variant: 'destructive',
      });
      return;
    }
    
    const newItems = [...currentItems];
    newItems.splice(index, 1);
    form.setValue('lineItems', newItems);
    
    // Recalculate totals
    const { subtotal, total } = calculateLineTotals(newItems);
    form.setValue('subtotal', subtotal);
    form.setValue('total', total);
  };
  
  // Update line item and recalculate totals
  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const currentItems = [...form.getValues('lineItems')];
    const item = { ...currentItems[index], [field]: value };
    
    // If quantity or unit price changed, recalculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) : parseFloat(item.quantity.toString());
      const unitPrice = field === 'unitPrice' ? parseFloat(value) : parseFloat(item.unitPrice);
      
      if (!isNaN(quantity) && !isNaN(unitPrice)) {
        item.totalPrice = (quantity * unitPrice).toFixed(2);
      }
    }
    
    currentItems[index] = item;
    form.setValue(`lineItems.${index}`, item);
    
    // Recalculate totals
    const { subtotal, total } = calculateLineTotals(currentItems);
    form.setValue('subtotal', subtotal);
    form.setValue('total', total);
  };
  
  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    try {
      // Ensure all required fields are present
      if (!data.contactId) {
        toast({
          title: 'Error',
          description: 'Please select a customer',
          variant: 'destructive',
        });
        return;
      }
      
      // Convert string values to proper types
      const formattedData = {
        ...data,
        // Ensure line items have proper types for quantity
        lineItems: data.lineItems.map(item => ({
          ...item,
          quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity
        }))
      };
      
      console.log('Submitting estimate data:', formattedData);
      createMutation.mutate(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create estimate. Please check the form data.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/estimates')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Estimate</h1>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Content Column */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estimate Details</CardTitle>
                    <CardDescription>
                      Create a new estimate for your customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contactId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contacts?.map((contact: Contact) => (
                                <SelectItem key={contact.id} value={contact.id.toString()}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Flooring Type Selection with Templates */}
                    <div className="p-4 border rounded-md bg-gray-50">
                      <h3 className="font-medium mb-3 flex items-center">
                        <span>Quick Fill Options</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="ml-2 h-5 w-5">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Select a flooring type and enter square footage to auto-fill estimate line items with industry-standard pricing.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label htmlFor="flooringType">Flooring Type</Label>
                          <Select
                            value={selectedFlooringType}
                            onValueChange={setSelectedFlooringType}
                          >
                            <SelectTrigger id="flooringType">
                              <SelectValue placeholder="Select flooring type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(flooringOptions).map(([key, option]) => (
                                <SelectItem key={key} value={key}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="squareFootage">Square Footage</Label>
                          <Input
                            id="squareFootage"
                            type="number"
                            min="0"
                            placeholder="e.g., 500"
                            value={squareFootage || ''}
                            onChange={(e) => setSquareFootage(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="button"
                        onClick={() => applyFlooringTemplate(selectedFlooringType, squareFootage)}
                        disabled={!selectedFlooringType || squareFootage <= 0}
                        className="w-full"
                      >
                        Apply Template
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimate Title (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Hardwood Flooring Installation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter a detailed description of the work to be done"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Valid Until (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>
                      Add products and services to this estimate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.watch('lineItems')?.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                  placeholder="Description"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                                  step="0.01"
                                  min="0.01"
                                  className="w-[80px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.unit}
                                  onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                                  placeholder="ea"
                                  className="w-[80px]"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5">$</span>
                                  <Input
                                    type="text"
                                    value={item.unitPrice}
                                    onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                                    placeholder="0.00"
                                    className="pl-7 w-[100px]"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5">$</span>
                                  <Input
                                    readOnly
                                    value={item.totalPrice}
                                    className="pl-7 w-[100px] bg-gray-50"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLineItem(index)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addLineItem}
                        className="mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Line Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="termsAndConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms & Conditions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your standard terms and conditions"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add any additional notes for the customer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${form.watch('subtotal')}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${form.watch('total')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create Estimate'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}