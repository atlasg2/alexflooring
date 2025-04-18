import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, ArrowRight, Send, X, Loader2, Home, Calculator, Calendar, HelpCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import apsLogo from "@/assets/aps_logo.png";

// Quick response options
const QUICK_RESPONSES = [
  { icon: <Calculator className="h-4 w-4 mr-2" />, text: "I'd like a quote" },
  { icon: <Calendar className="h-4 w-4 mr-2" />, text: "Schedule a consultation" },
  { icon: <Home className="h-4 w-4 mr-2" />, text: "Question about services" },
  { icon: <HelpCircle className="h-4 w-4 mr-2" />, text: "Other inquiry" }
];

const LOCALSTORAGE_KEY = 'aps_chat_user_info';

const ChatWidget = () => {
  // State for chat widget functionality
  const [isOpen, setIsOpen] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Load saved user information when component mounts
  useEffect(() => {
    try {
      const savedUserInfo = localStorage.getItem(LOCALSTORAGE_KEY);
      if (savedUserInfo) {
        const { name: savedName, email: savedEmail, phone: savedPhone } = JSON.parse(savedUserInfo);
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
        if (savedPhone) setPhone(savedPhone);
      }
    } catch (error) {
      console.error('Error loading saved chat user info:', error);
    }
  }, []);
  
  // Toggle the chat widget open/closed state
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Focus the message input when chat is opened
    if (!isOpen) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 300);
    }
  };
  
  // Submit the initial contact information
  const submitInitialInfo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      // No toast, just show validation messages
      return;
    }
    
    // Save user info to localStorage for future use
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ name, email, phone }));
    } catch (error) {
      console.error('Error saving chat user info:', error);
    }
    
    setIsInitial(false);
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };
  
  // Insert a quick response into the message field
  const insertQuickResponse = (responseText: string) => {
    setMessage(responseText);
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };
  
  // Send a chat message to the backend
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSending(true);
    
    try {
      // Create a chat message using the correct API endpoint for contact submissions
      // Also explicitly create a contact
      const response = await apiRequest('POST', '/api/contact', {
        name,
        email,
        phone,
        message,
        subject: 'Chat Message',
        type: 'chat',
        service: 'Chat Widget',
        status: 'new', // Explicitly set status to ensure it's captured as a new message
        createContact: true // Flag to explicitly create a contact
      });
      
      console.log('Chat message sent successfully:', response);
      
      // No toast notification, just reset the widget
      setMessage('');
      
      // Close the chat immediately
      setIsOpen(false);
      
      // Reset to initial state after chat closes
      setTimeout(() => {
        setIsInitial(true);
      }, 500);
      
    } catch (error) {
      console.error("Error sending chat message:", error);
      // No toast notification on error either
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <>
      {/* Chat button fixed at bottom right */}
      <Button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full z-50 shadow-lg p-0"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>
      
      {/* Chat widget */}
      <div 
        className={cn(
          "fixed bottom-24 right-6 w-[350px] max-w-[90vw] z-50 transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        )}
      >
        <Card className="shadow-xl border-t-4 border-t-secondary overflow-hidden">
          <CardHeader className="bg-primary text-white rounded-t-lg pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src={apsLogo} 
                  alt="APS Flooring Logo" 
                  className="h-8 w-8 rounded-full" 
                />
                <span>Chat with Us</span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            {isInitial ? (
              // Initial form to collect user information
              <form onSubmit={submitInitialInfo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              // Message form after user information is collected
              <form onSubmit={sendMessage} className="space-y-4">
                {/* Quick response options */}
                <div className="space-y-2">
                  <Label htmlFor="quickResponses">Common Inquiries</Label>
                  <div className="flex flex-col space-y-2">
                    {QUICK_RESPONSES.map((response, index) => (
                      <Button 
                        key={index}
                        type="button"
                        variant="outline"
                        className="text-xs h-auto py-2 flex justify-start"
                        onClick={() => insertQuickResponse(response.text)}
                      >
                        {response.icon}
                        <span>{response.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    ref={messageInputRef}
                    id="message"
                    placeholder="How can we help you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center text-xs text-muted-foreground pt-2 pb-4">
            <p>We typically respond within 1-2 business hours</p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ChatWidget;