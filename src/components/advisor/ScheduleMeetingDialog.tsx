
import { useState } from 'react';
import { Advisor, AdvisorMeeting } from '@/types';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduleMeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  advisors: Advisor[];
  selectedAdvisor: Advisor | null;
  onSchedule: () => void;
  newMeeting: Partial<AdvisorMeeting>;
  onNewMeetingChange: (meeting: Partial<AdvisorMeeting>) => void;
  errors: Record<string, string>;
}

const ScheduleMeetingDialog = ({
  isOpen,
  onOpenChange,
  advisors,
  selectedAdvisor,
  onSchedule,
  newMeeting,
  onNewMeetingChange,
  errors
}: ScheduleMeetingDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Advisor Meeting</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="advisor">Select Advisor</Label>
            <Select
              value={newMeeting.advisorId?.toString()}
              onValueChange={(value) => onNewMeetingChange({ ...newMeeting, advisorId: parseInt(value) })}
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
                  onNewMeetingChange({ ...newMeeting, date: date.toISOString() });
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
              onChange={(e) => onNewMeetingChange({ ...newMeeting, topic: e.target.value })}
              className={errors.topic ? 'border-red-500' : ''}
              placeholder="e.g., Retirement Planning, Investment Strategy"
            />
            {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSchedule} className="bg-finance-primary hover:bg-finance-primary/90">
            Schedule Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMeetingDialog;
