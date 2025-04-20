
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { advisorService } from '@/services/api';
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

const AdvisorPage = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [meetings, setMeetings] = useState<AdvisorMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [newMeeting, setNewMeeting] = useState<Partial<AdvisorMeeting>>({
    advisorId: 0,
    date: new Date().toISOString(),
    topic: ''
  });
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { id: number; sender: 'user' | 'advisor'; text: string; timestamp: string }[]
  >([
    // Initial demo messages
    {
      id: 1,
      sender: 'advisor',
      text: 'Hello! How can I help you with your financial planning today?',
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }
  ]);
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [advisorsData, meetingsData] = await Promise.all([
          advisorService.getAdvisors(),
          advisorService.getAdvisorMeetings()
        ]);
        setAdvisors(advisorsData);
        setMeetings(meetingsData);
        if (advisorsData.length > 0) {
          setSelectedAdvisor(advisorsData[0]);
          setNewMeeting(prev => ({ ...prev, advisorId: advisorsData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching advisor data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Form handling
  const validateMeetingForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newMeeting.advisorId) {
      newErrors.advisorId = 'Advisor is required';
    }
    
    if (!newMeeting.date) {
      newErrors.date = 'Date and time are required';
    } else {
      const meetingDate = new Date(newMeeting.date);
      const today = new Date();
      if (meetingDate <= today) {
        newErrors.date = 'Meeting date must be in the future';
      }
    }
    
    if (!newMeeting.topic) {
      newErrors.topic = 'Topic is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleScheduleMeeting = async () => {
    if (!validateMeetingForm()) {
      return;
    }
    
    try {
      await advisorService.scheduleAdvisorMeeting(newMeeting as Omit<AdvisorMeeting, 'id' | 'userId' | 'advisor'>);
      const updatedMeetings = await advisorService.getAdvisorMeetings();
      setMeetings(updatedMeetings);
      setNewMeeting({
        advisorId: selectedAdvisor?.id || 0,
        date: new Date().toISOString(),
        topic: ''
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };
  
  const handleCancelMeeting = async (id: number) => {
    try {
      await advisorService.cancelAdvisorMeeting(id);
      const updatedMeetings = await advisorService.getAdvisorMeetings();
      setMeetings(updatedMeetings);
    } catch (error) {
      console.error('Error canceling meeting:', error);
    }
  };
  
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedAdvisor) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user' as const,
      text: chatMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    
    // Simulate advisor response after a short delay
    setTimeout(() => {
      const advisorResponse = {
        id: Date.now() + 1,
        sender: 'advisor' as const,
        text: `Thanks for your message. As your financial advisor, I'm here to help. Can you provide more details about your financial goals?`,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, advisorResponse]);
    }, 1000);
  };
  
  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy h:mm a');
  };
  
  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };
  
  if (loading) {
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
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Advisors</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Advisor Profiles Section */}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4 bg-finance-primary hover:bg-finance-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </DialogTrigger>
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
                            onChange={(e) => setNewMeeting(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                            className={errors.date ? 'border-red-500' : ''}
                          />
                          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        
                        <div>
                          <Label htmlFor="topic">Meeting Topic</Label>
                          <Input
                            id="topic"
                            value={newMeeting.topic}
                            onChange={(e) => setNewMeeting(prev => ({ ...prev, topic: e.target.value }))}
                            className={errors.topic ? 'border-red-500' : ''}
                            placeholder="e.g., Retirement Planning, Investment Strategy"
                          />
                          {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleScheduleMeeting} className="bg-finance-primary hover:bg-finance-primary/90">
                          Schedule Meeting
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-finance-primary hover:bg-finance-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Another Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      {/* Dialog content - reused from above */}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Advisor Details & Chat Section */}
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
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-finance-primary hover:bg-finance-primary/90">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting with {selectedAdvisor.name.split(' ')[0]}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        {/* Dialog content - reused from above */}
                      </DialogContent>
                    </Dialog>
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
                      />
                      <Button 
                        onClick={handleSendMessage}
                        size="icon"
                        className="bg-finance-primary hover:bg-finance-primary/90"
                      >
                        <Send className="h-4 w-4" />
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
    </DashboardLayout>
  );
};

export default AdvisorPage;
