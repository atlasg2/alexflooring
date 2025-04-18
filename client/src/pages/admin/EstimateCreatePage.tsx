import { useState } from 'react';
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
import { CalendarIcon, Plus, Trash, ArrowLeft, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

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

// Helper function to calculate totals
const calculateLineTotals = (items: LineItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice || '0'), 0);
  return {
    subtotal: subtotal.toFixed(2),
    total: subtotal.toFixed(2) // Without tax or discount for now
  };
};

// Create form schema
const estimateFormSchema = z.object({
  contactId: z.number({
    required_error: "Customer is required",
  }),
  title: z.string().min(1, "Title is required"),
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
      title: '',
      description: '',
      lineItems: [defaultLineItem],
      subtotal: '0.00',
      total: '0.00',
    },
  });
  
  // Get form values for calculations
  const { lineItems, subtotal, total } = form.watch();
  
  // Fetch contacts for the dropdown
  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/crm/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });
  
  // Mutation to create estimate
  const createMutation = useMutation({
    mutationFn: async (data: EstimateFormValues) => {
      const response = await fetch('/api/admin/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create estimate');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast({
        title: 'Estimate Created',
        description: `Estimate #${data.estimateNumber} has been created successfully.`,
      });
      navigate('/admin/estimates');
    },
    onError: (error) => {
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
  const onSubmit = (data: EstimateFormValues) => {
    createMutation.mutate(data);
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
                            defaultValue={field.value?.toString()}
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
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimate Title</FormLabel>
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