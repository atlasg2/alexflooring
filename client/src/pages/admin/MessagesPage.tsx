import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Mail, CheckCircle, Circle, Clock, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';

// Type for chat messages
interface ChatMessage {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  contactId?: number | null;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      // First check if we're logged in
      try {
        const authResponse = await fetch('/api/user');
        if (!authResponse.ok) {
          console.error("Auth check failed, status:", authResponse.status);
          const authText = await authResponse.text();
          console.error("Auth check response:", authText);
          
          toast({
            title: "Authentication error",
            description: "You may need to log in again",
            variant: "destructive"
          });
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
          return;
        }
      } catch (authError) {
        console.error("Auth check error:", authError);
      }
    
      // Get all contact submissions and filter for those with type 'chat'
      console.log("Fetching contact submissions...");
      const response = await fetch('/api/admin/contacts', {
        credentials: 'include' // Ensure cookies are sent
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Received contact submissions:", data);
        
        if (!Array.isArray(data)) {
          console.error("Expected array but received:", typeof data);
          toast({
            title: "Data format error",
            description: "Received unexpected data format from server",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Filter and convert contact submissions to chat message format
        const chatMessages = data
          .filter((submission: any) => submission.type === 'chat')
          .map((submission: any) => ({
            id: submission.id,
            name: submission.name,
            email: submission.email,
            phone: submission.phone,
            message: submission.message,
            isRead: submission.status !== 'new',
            createdAt: submission.createdAt,
            contactId: submission.contactId
          }));
        
        console.log("Filtered chat messages:", chatMessages);
        setMessages(chatMessages);
      } else {
        const errorText = await response.text();
        console.error(`Error response (${response.status}):`, errorText);
        
        toast({
          title: `Error fetching messages (${response.status})`,
          description: errorText || "Please try again or check your connection",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error fetching messages",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMessages();
  }, []);
  
  // Mark a message as read (update contact submission status)
  const markAsRead = async (id: number) => {
    try {
      // Update the contact submission status to 'read'
      await apiRequest('PUT', `/api/admin/contacts/${id}/status`, { status: 'read' });
      
      // Update local state
      setMessages(messages.map(message => 
        message.id === id ? { ...message, isRead: true } : message
      ));
      
      toast({
        title: "Message marked as read",
      });
    } catch (error) {
      toast({
        title: "Error updating message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  // Filter messages based on search query and read status
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      (message.name && message.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (message.email && message.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'unread' && !message.isRead) || 
      (statusFilter === 'read' && message.isRead);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Chat Messages">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chat Messages</CardTitle>
          <CardDescription>
            Messages from the website chat widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="flex justify-center items-center p-12">
              <p className="text-muted-foreground">No messages found</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={`${!message.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg font-medium">
                      {message.name || 'Anonymous User'}
                      {!message.isRead && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100" variant="outline">
                          New
                        </Badge>
                      )}
                      {message.contactId && (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100" variant="outline">
                          CRM Contact
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDate(message.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col space-y-1 mt-1">
                  {message.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-1" />
                      {message.email}
                    </div>
                  )}
                  {message.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {message.phone}
                    </div>
                  )}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="whitespace-pre-line">{message.message}</p>
              </CardContent>
              <Separator />
              <CardContent className="pt-4 pb-4 flex justify-between items-center">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {message.isRead ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Read</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 text-blue-600" />
                      <span>Unread</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {!message.isRead && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => markAsRead(message.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <div className="flex gap-2">
                    {message.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `mailto:${message.email}`}
                      >
                        <Mail className="h-4 w-4 mr-1" /> Email
                      </Button>
                    )}
                    {message.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `tel:${message.phone}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call
                      </Button>
                    )}
                  </div>
                  {message.contactId && (
                    <Button 
                      size="sm"
                      onClick={() => window.location.href = `/admin/crm/contacts/${message.contactId}`}
                    >
                      View Contact
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default MessagesPage;