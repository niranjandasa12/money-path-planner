
import { useState } from 'react';
import { Advisor } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AdvisorListProps {
  advisors: Advisor[];
  selectedAdvisor: Advisor | null;
  onSelectAdvisor: (advisor: Advisor) => void;
}

const AdvisorList = ({ advisors, selectedAdvisor, onSelectAdvisor }: AdvisorListProps) => {
  return (
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
              onClick={() => onSelectAdvisor(advisor)}
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
  );
};

export default AdvisorList;
