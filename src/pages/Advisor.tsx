import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { advisorService } from '@/services/advisors';
import { Advisor, AdvisorMeeting } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, Mail, Briefcase, Plus, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Define proper types for chat messages
type ChatMessage = {
  id: number;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
};

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const AdvisorPage = () => {
  const queryClient = useQueryClient();
  
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [newMeeting, setNewMeeting] = useState<Partial<AdvisorMeeting>>({
    advisorId: 0,
    date: new Date().toISOString(),
    topic: ''
  });
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'advisor',
      text: 'Hello! How can I help you with your financial planning today?',
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { 
    data: advisors = [], 
    isLoading: advisorsLoading 
  } = useQuery({
    queryKey: ['advisors'],
    queryFn: () => advisorService.getAdvisors(),
  });
  
  const { 
    data: meetings = [], 
    isLoading: meetingsLoading 
  } = useQuery({
    queryKey: ['advisorMeetings'],
    queryFn: () => advisorService.getAdvisorMeetings(),
  });

  const scheduleMeetingMutation = useMutation({
    mutationFn: (meetingData: Omit<AdvisorMeeting, "id" | "userId" | "advisor">) => 
      advisorService.scheduleAdvisorMeeting(meetingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisorMeetings'] });
      toast.success("Meeting scheduled successfully");
      setNewMeeting({
        advisorId: selectedAdvisor?.id || 0,
        date: new Date().toISOString(),
        topic: ''
      });
      setIsScheduleDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to schedule meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const cancelMeetingMutation = useMutation({
    mutationFn: (id: number) => advisorService.cancelAdvisorMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisorMeetings'] });
      toast.success("Meeting cancelled successfully");
    },
    onError: (error) => {
      toast.error(`Failed to cancel meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  useEffect(() => {
    if (advisors.length > 0 && !selectedAdvisor) {
      setSelectedAdvisor(advisors[0]);
      setNewMeeting(prev => ({ ...prev, advisorId: advisors[0].id }));
    }
  }, [advisors, selectedAdvisor]);
  
  const validateMeetingForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newMeeting.advisorId) {
      newErrors.advisorId = 'Advisor is required';
    }
    
    if (!newMeeting.date) {
      newErrors.date = 'Date and time are required';
    } else {
      const meetingDate = new Date(newMeeting.date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      meetingDate.setHours(0, 0, 0, 0);
      if (meetingDate < now) {
        newErrors.date = 'Meeting date must be in the future';
      }
    }
    
    if (!newMeeting.topic || newMeeting.topic.trim() === '') {
      newErrors.topic = 'Topic is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleScheduleMeeting = () => {
    console.log("Scheduling meeting with data:", newMeeting);
    if (!validateMeetingForm()) {
      console.log("Form validation failed with errors:", errors);
      return;
    }
    
    const meetingToSchedule: Omit<AdvisorMeeting, "id" | "userId" | "advisor"> = {
      advisorId: newMeeting.advisorId as number,
      date: newMeeting.date as string,
      topic: newMeeting.topic as string
    };
    
    console.log("Submitting meeting to API:", meetingToSchedule);
    scheduleMeetingMutation.mutate(meetingToSchedule);
  };
  
  const handleCancelMeeting = async (id: number) => {
    cancelMeetingMutation.mutate(id);
  };
  
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedAdvisor) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: chatMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const newConvoMessage: ConversationMessage = { role: 'user', content: chatMessage.trim() };
    const updatedConversationHistory: ConversationMessage[] = [...conversationHistory, newConvoMessage];
    setConversationHistory(updatedConversationHistory);
    
    const currentMessage = chatMessage.trim();
    setChatMessage('');
    setChatLoading(true);
    
    try {
      console.log("Sending chat request to edge function with messages:", JSON.stringify(updatedConversationHistory));
      const response = await fetch('https://uocqgeahfighgfnkwhyw.supabase.co/functions/v1/advisor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedConversationHistory
        }),
      });
      
      if (!response.ok) {
        console.error(`API responded with status: ${response.status}`);
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected response format:", data);
        throw new Error("Unexpected response format from API");
      }
      
      const aiResponse = data.choices[0].message;
      const newAssistantMessage: ConversationMessage = { 
        role: 'assistant', 
        content: aiResponse.content 
      };
      
      setConversationHistory(prev => [...prev, newAssistantMessage]);
      
      const advisorResponse: ChatMessage = {
        id: Date.now() + 1,
        sender: 'advisor',
        text: aiResponse.content,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, advisorResponse]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'advisor',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };
  
  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy h:mm a');
  };
  
  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };
  
  const isLoading = advisorsLoading || meetingsLoading;
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p>Loading advisor data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const scheduleDialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Schedule Advisor Meeting</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="advisor">Select Advisor</Label>
          <Select
            value={newMeeting.advisorId?.toString()}
            onValueChange={(value) => setNewMeeting(prev => ({ ...prev, advisorId: parseInt(value) }))}
          >
            <SelectTrigger id="advisor" className={errors.advisorId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select advisor" />
            </SelectTrigger>
            <SelectContent>
              {advisors.map((advisor) => (
                <SelectItem key={advisor.id} value={advisor.id.toString()}>
                  {advisor.name} - {advisor.expertise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.advisorId && <p className="text-red-500 text-xs mt-1">{errors.advisorId}</p>}
        </div>
        
        <div>
          <Label htmlFor="date">Date and Time</Label>
          <Input
            id="date"
            type="datetime-local"
            value={newMeeting.date ? new Date(newMeeting.date).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) {
                setNewMeeting(prev => ({ ...prev, date: date.toISOString() }));
              }
            }}
            className={errors.date ? 'border-red-500' : ''}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
        
        <div>
          <Label htmlFor="topic">Meeting Topic</Label>
          <Input
            id="topic"
            value={newMeeting.topic || ''}
            onChange={(e) => setNewMeeting(prev => ({ ...prev, topic: e.target.value }))}
            className={errors.topic ? 'border-red-500' : ''}
            placeholder="e.g., Retirement Planning, Investment Strategy"
          />
          {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleScheduleMeeting} className="bg-finance-primary hover:bg-finance-primary/90">
          Schedule Meeting
        </Button>
      </DialogFooter>
    </DialogContent>
  );
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Advisors</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Your Advisors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advisors.map(advisor => (
                  <div 
                    key={advisor.id} 
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedAdvisor?.id === advisor.id 
                        ? 'bg-finance-primary text-white' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedAdvisor(advisor);
                      setNewMeeting(prev => ({ ...prev, advisorId: advisor.id }));
                    }}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={advisor.imageUrl} alt={advisor.name} />
                        <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="font-medium">{advisor.name}</div>
                        <div className={`text-sm ${selectedAdvisor?.id === advisor.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {advisor.expertise}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">No upcoming meetings</p>
                  <Button 
                    className="mt-4 bg-finance-primary hover:bg-finance-primary/90"
                    onClick={() => setIsScheduleDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.map(meeting => (
                    <div key={meeting.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={meeting.advisor?.imageUrl} 
                              alt={meeting.advisor?.name} 
                            />
                            <AvatarFallback>
                              {meeting.advisor?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div className="font-medium">{meeting.advisor?.name}</div>
                            <div className="text-xs text-gray-500">{meeting.advisor?.expertise}</div>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-finance-danger" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Meeting?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this meeting? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleCancelMeeting(meeting.id)}
                                className="bg-finance-danger hover:bg-finance-danger/90"
                              >
                                Cancel Meeting
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="mt-3 text-sm">
                        <div className="flex items-center text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatMeetingDate(meeting.date)}
                        </div>
                        <div className="font-medium">{meeting.topic}</div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    className="w-full bg-finance-primary hover:bg-finance-primary/90"
                    onClick={() => setIsScheduleDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Another Meeting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedAdvisor ? (
            <Card className="shadow-sm h-full flex flex-col">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={selectedAdvisor.imageUrl} alt={selectedAdvisor.name} />
                      <AvatarFallback>{selectedAdvisor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedAdvisor.name}</h3>
                      <p className="text-sm text-gray-500">{selectedAdvisor.expertise}</p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Tabs defaultValue="profile" className="flex-1 flex flex-col">
                  <TabsList className="mx-auto mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="flex-1 flex flex-col">
                    <div className="bg-gray-50 p-6 rounded-lg mb-4">
                      <div className="flex items-center justify-center mb-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={selectedAdvisor.imageUrl} alt={selectedAdvisor.name} />
                          <AvatarFallback>{selectedAdvisor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="font-medium">{selectedAdvisor.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="font-medium">{selectedAdvisor.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Briefcase className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Expertise</p>
                            <p className="font-medium">{selectedAdvisor.expertise}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">About</h4>
                        <p className="text-sm text-gray-600">
                          {selectedAdvisor.name} is a professional financial advisor specializing in {selectedAdvisor.expertise.toLowerCase()}. 
                          With years of experience in the financial industry, {selectedAdvisor.name.split(' ')[0]} helps clients achieve their financial goals through personalized strategies and expert guidance.
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      className="bg-finance-primary hover:bg-finance-primary/90"
                      onClick={() => {
                        setNewMeeting({
                          advisorId: selectedAdvisor.id,
                          date: new Date().toISOString(),
                          topic: ''
                        });
                        setIsScheduleDialogOpen(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting with {selectedAdvisor.name.split(' ')[0]}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="chat" className="flex-1 flex flex-col space-y-4">
                    <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4">
                      {chatMessages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'user' 
                              ? 'bg-finance-primary text-white' 
                              : 'bg-white border'
                          }`}>
                            <div className="text-sm">
                              {message.text}
                            </div>
                            <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
                              {formatChatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Textarea
                        placeholder={`Message ${selectedAdvisor.name.split(' ')[0]}...`}
                        className="resize-none"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={chatLoading}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        size="icon"
                        className="bg-finance-primary hover:bg-finance-primary/90"
                        disabled={chatLoading}
                      >
                        {chatLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg p-12">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">No Advisor Selected</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Select an advisor from the list to view their profile and chat
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        {scheduleDialogContent}
      </Dialog>
    </DashboardLayout>
  );
};

export default AdvisorPage;
