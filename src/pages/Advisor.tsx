
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { advisorService } from '@/services/advisors';
import { Advisor, AdvisorMeeting } from '@/types';
import { toast } from 'sonner';

// Import the new refactored components
import AdvisorList from '@/components/advisor/AdvisorList';
import MeetingsList from '@/components/advisor/MeetingsList';
import AdvisorDetailCard from '@/components/advisor/AdvisorDetailCard';
import ScheduleMeetingDialog from '@/components/advisor/ScheduleMeetingDialog';

const AdvisorPage = () => {
  const queryClient = useQueryClient();
  
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [newMeeting, setNewMeeting] = useState<Partial<AdvisorMeeting>>({
    advisorId: 0,
    date: new Date().toISOString(),
    topic: ''
  });
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
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
    isLoading: meetingsLoading,
    refetch: refetchMeetings
  } = useQuery({
    queryKey: ['advisorMeetings'],
    queryFn: () => advisorService.getAdvisorMeetings(),
  });

  const scheduleMeetingMutation = useMutation({
    mutationFn: (meetingData: Omit<AdvisorMeeting, "id" | "userId" | "advisor">) => 
      advisorService.scheduleAdvisorMeeting(meetingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisorMeetings'] });
      refetchMeetings(); // Explicitly refetch meetings after scheduling
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
      refetchMeetings(); // Explicitly refetch meetings after cancellation
      toast.success("Meeting cancelled successfully");
    },
    onError: (error) => {
      toast.error(`Failed to cancel meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Set the first advisor as selected if none is selected
  useState(() => {
    if (advisors.length > 0 && !selectedAdvisor) {
      setSelectedAdvisor(advisors[0]);
      setNewMeeting(prev => ({ ...prev, advisorId: advisors[0].id }));
    }
  });
  
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
  
  const handleCancelMeeting = (id: number) => {
    cancelMeetingMutation.mutate(id);
  };
  
  const handleSelectAdvisor = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setNewMeeting(prev => ({ ...prev, advisorId: advisor.id }));
  };

  const handleOpenScheduleDialog = () => {
    setNewMeeting({
      advisorId: selectedAdvisor?.id || 0,
      date: new Date().toISOString(),
      topic: ''
    });
    setErrors({});
    setIsScheduleDialogOpen(true);
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
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Advisors</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <AdvisorList 
            advisors={advisors} 
            selectedAdvisor={selectedAdvisor} 
            onSelectAdvisor={handleSelectAdvisor} 
          />
          
          <MeetingsList 
            meetings={meetings} 
            onScheduleMeeting={handleOpenScheduleDialog} 
            onCancelMeeting={handleCancelMeeting} 
          />
        </div>
        
        <div className="lg:col-span-2">
          <AdvisorDetailCard 
            advisor={selectedAdvisor} 
            onScheduleMeeting={handleOpenScheduleDialog} 
          />
        </div>
      </div>
      
      <ScheduleMeetingDialog 
        isOpen={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        advisors={advisors}
        selectedAdvisor={selectedAdvisor}
        onSchedule={handleScheduleMeeting}
        newMeeting={newMeeting}
        onNewMeetingChange={setNewMeeting}
        errors={errors}
      />
    </DashboardLayout>
  );
};

export default AdvisorPage;
