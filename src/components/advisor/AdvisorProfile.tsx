
import { User, Mail, Briefcase, Calendar } from 'lucide-react';
import { Advisor } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AdvisorProfileProps {
  advisor: Advisor;
  onScheduleMeeting: () => void;
}

const AdvisorProfile = ({ advisor, onScheduleMeeting }: AdvisorProfileProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-50 p-6 rounded-lg mb-4">
        <div className="flex items-center justify-center mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={advisor.imageUrl} alt={advisor.name} />
            <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="font-medium">{advisor.name}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="font-medium">{advisor.email}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Briefcase className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Expertise</p>
              <p className="font-medium">{advisor.expertise}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">About</h4>
          <p className="text-sm text-gray-600">
            {advisor.name} is a professional financial advisor specializing in {advisor.expertise.toLowerCase()}. 
            With years of experience in the financial industry, {advisor.name.split(' ')[0]} helps clients achieve their financial goals through personalized strategies and expert guidance.
          </p>
        </div>
      </div>
      
      <Button 
        className="bg-finance-primary hover:bg-finance-primary/90"
        onClick={onScheduleMeeting}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Schedule Meeting with {advisor.name.split(' ')[0]}
      </Button>
    </div>
  );
};

export default AdvisorProfile;
