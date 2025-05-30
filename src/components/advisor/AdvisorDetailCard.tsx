
import { User } from 'lucide-react';
import { Advisor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AdvisorProfile from './AdvisorProfile';

interface AdvisorDetailCardProps {
  advisor: Advisor | null;
  onScheduleMeeting: () => void;
}

const AdvisorDetailCard = ({ advisor, onScheduleMeeting }: AdvisorDetailCardProps) => {
  if (!advisor) {
    return (
      <div className="h-full flex items-center justify-center border rounded-lg p-12">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium">No Advisor Selected</h3>
          <p className="text-sm text-gray-500 mt-2">
            Select an advisor from the list to view their profile
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="shadow-sm h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={advisor.imageUrl} alt={advisor.name} />
            <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{advisor.name}</h3>
            <p className="text-sm text-gray-500">{advisor.expertise}</p>
          </div>
        </div>
      </div>
      
      <CardContent className="flex-1 flex flex-col pt-6">
        <AdvisorProfile 
          advisor={advisor} 
          onScheduleMeeting={onScheduleMeeting} 
        />
      </CardContent>
    </Card>
  );
};

export default AdvisorDetailCard;
