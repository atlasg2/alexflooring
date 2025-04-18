import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CalendarPlus, Clock, Loader2, X } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { Badge } from '@/components/ui/badge';

// Types
interface Appointment {
  id: number;
  title: string;
  description: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  date: string;
  startTime: string;
  endTime: string | null;
  status: string;
  notes: string | null;
  contactSubmissionId: number | null;
  createdAt: string;
}

// New appointment form
const NewAppointmentForm = ({ selectedDate, onClose, onSuccess }: { 
  selectedDate: Date | undefined, 
  onClose: () => void,
  onSuccess: () => void
}) => {
  const [location, params] = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if we have pre-filled data (from contact page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const email = params.get('email');
    const contactId = params.get('contactId');
    
    if (name) setClientName(name);
    if (email) setClientEmail(email);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Please select a date",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Get contactId from URL if it exists
      const params = new URLSearchParams(window.location.search);
      const contactId = params.get('contactId');
      
      const appointmentData = {
        title,
        description,
        clientName,
        clientEmail,
        clientPhone,
        date: formattedDate,
        startTime,
        endTime,
        notes,
        contactSubmissionId: contactId ? parseInt(contactId) : null
      };
      
      await apiRequest('POST', '/api/admin/appointments', appointmentData);
      
      toast({
        title: "Appointment created",
        description: "The appointment has been scheduled successfully",
      });
      
      onSuccess();
      onClose();
      
    } catch (error) {
      toast({
        title: "Error creating appointment",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Appointment Title</Label>
        <Input
          id="title"
          placeholder="e.g., Initial Consultation, Site Measurement"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the appointment"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            placeholder="Full name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientPhone">Phone Number</Label>
          <Input
            id="clientPhone"
            placeholder="Phone number"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientEmail">Email Address</Label>
        <Input
          id="clientEmail"
          type="email"
          placeholder="Email address"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule Appointment"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Appointment status badge
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    scheduled: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    completed: 'bg-green-100 text-green-800 hover:bg-green-100',
    cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
  };
  
  const style = statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
  
  return (
    <Badge className={style} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Function to format time in 12-hour format
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  
  // Check if we're on the new appointment route
  const [isNewRoute] = useRoute('/admin/calendar/new');
  
  useEffect(() => {
    if (isNewRoute) {
      setIsNewAppointmentOpen(true);
    }
  }, [isNewRoute]);
  
  // Fetch appointments for the selected date
  const fetchAppointments = async (selectedDate: Date) => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/admin/calendar/${formattedDate}`);
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        toast({
          title: "Error fetching appointments",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching appointments",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // When date changes, fetch appointments
  useEffect(() => {
    if (date) {
      fetchAppointments(date);
    }
  }, [date]);
  
  // Update appointment status
  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await apiRequest('PUT', `/api/admin/appointments/${id}/status`, { status });
      
      // Update local state
      setAppointments(appointments.map(appointment => 
        appointment.id === id ? { ...appointment, status } : appointment
      ));
      
      toast({
        title: "Status updated",
        description: `Appointment marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AdminLayout title="Schedule">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Select a date to view or schedule appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
          <CardFooter className="flex justify-center pt-0">
            <Button 
              onClick={() => setIsNewAppointmentOpen(true)}
              className="w-full"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </CardFooter>
        </Card>
        
        {/* Appointments for selected date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {date ? (
                <>Appointments for {date.toLocaleDateString()}</>
              ) : (
                <>Select a date</>
              )}
            </CardTitle>
            <CardDescription>
              View and manage appointments for the selected date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !date ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Please select a date to view appointments</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No appointments scheduled for this date</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsNewAppointmentOpen(true)}
                >
                  Schedule an Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{appointment.title}</CardTitle>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(appointment.startTime)}
                        {appointment.endTime && ` - ${formatTime(appointment.endTime)}`}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">Client:</p>
                          <p>{appointment.clientName}</p>
                          {appointment.clientEmail && <p className="text-sm">{appointment.clientEmail}</p>}
                          {appointment.clientPhone && <p className="text-sm">{appointment.clientPhone}</p>}
                        </div>
                        
                        {appointment.description && (
                          <div>
                            <p className="font-medium">Description:</p>
                            <p className="text-sm">{appointment.description}</p>
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div>
                            <p className="font-medium">Notes:</p>
                            <p className="text-sm">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="pt-3 flex justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `tel:${appointment.clientPhone}`}
                        disabled={!appointment.clientPhone}
                      >
                        Call Client
                      </Button>
                      
                      <Select
                        value={appointment.status}
                        onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for {date?.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <NewAppointmentForm 
            selectedDate={date} 
            onClose={() => {
              setIsNewAppointmentOpen(false);
              // Remove query params
              navigate('/admin/calendar');
            }}
            onSuccess={() => {
              if (date) {
                fetchAppointments(date);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CalendarPage;