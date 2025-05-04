
import { useState } from 'react';
import { AdvisorMeeting } from '@/types';
import { format } from 'date-fns';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface MeetingsListProps {
  meetings: AdvisorMeeting[];
  onScheduleMeeting: () => void;
  onCancelMeeting: (id: number) => void;
}

const MeetingsList = ({ meetings, onScheduleMeeting, onCancelMeeting }: MeetingsListProps) => {
  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy h:mm a');
  };

  // Filter and sort upcoming meetings chronologically
  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
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
              onClick={onScheduleMeeting}
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
                        {meeting.advisor?.name ? meeting.advisor.name.charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="font-medium">{meeting.advisor?.name || 'Advisor'}</div>
                      <div className="text-xs text-gray-500">{meeting.advisor?.expertise || 'Financial Advisor'}</div>
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
                          onClick={() => onCancelMeeting(meeting.id)}
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
              onClick={onScheduleMeeting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Another Meeting
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingsList;
