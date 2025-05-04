
import { supabase } from "@/integrations/supabase/client";
import { Advisor, AdvisorMeeting } from "@/types";

// Types to match the database schema
type DbAdvisor = {
  id: number;
  name: string;
  email: string;
  expertise: string;
  image_url: string | null;
};

type DbAdvisorMeeting = {
  id: number;
  user_id: number | null;
  advisor_id: number | null;
  date: string;
  topic: string;
};

// Conversion functions
const mapToAdvisor = (dbAdvisor: DbAdvisor): Advisor => ({
  id: dbAdvisor.id,
  name: dbAdvisor.name,
  email: dbAdvisor.email,
  expertise: dbAdvisor.expertise,
  imageUrl: dbAdvisor.image_url || ''
});

const mapToDbAdvisorMeeting = (meeting: Omit<AdvisorMeeting, "id" | "userId" | "advisor">): Omit<DbAdvisorMeeting, "id" | "user_id"> => ({
  advisor_id: meeting.advisorId,
  date: meeting.date,
  topic: meeting.topic
});

const mapToAdvisorMeeting = async (dbMeeting: DbAdvisorMeeting): Promise<AdvisorMeeting> => {
  let advisor: Advisor | undefined;
  
  if (dbMeeting.advisor_id) {
    const { data } = await supabase
      .from('advisors')
      .select('*')
      .eq('id', dbMeeting.advisor_id)
      .single();
    
    if (data) {
      advisor = mapToAdvisor(data as DbAdvisor);
    }
  }
  
  return {
    id: dbMeeting.id,
    userId: dbMeeting.user_id || 1, // Default to user 1 if null
    advisorId: dbMeeting.advisor_id || 0,
    date: dbMeeting.date,
    topic: dbMeeting.topic,
    advisor
  };
};

export const advisorService = {
  async getAdvisors(): Promise<Advisor[]> {
    const { data, error } = await supabase
      .from('advisors')
      .select('*');

    if (error) {
      console.error('Error fetching advisors:', error);
      throw error;
    }

    return (data as DbAdvisor[]).map(mapToAdvisor);
  },

  async getAdvisorMeetings(): Promise<AdvisorMeeting[]> {
    const { data, error } = await supabase
      .from('advisor_meetings')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching advisor meetings:', error);
      throw error;
    }

    // Need to map all meetings and fetch their advisors
    const meetings = await Promise.all((data as DbAdvisorMeeting[]).map(mapToAdvisorMeeting));
    return meetings;
  },

  async scheduleAdvisorMeeting(meeting: Omit<AdvisorMeeting, "id" | "userId" | "advisor">): Promise<AdvisorMeeting> {
    console.log("Service received meeting data:", meeting);
    
    if (!meeting.topic || meeting.topic.trim() === '') {
      throw new Error('Meeting topic is required');
    }
    
    if (!meeting.advisorId) {
      throw new Error('Advisor ID is required');
    }
    
    if (!meeting.date) {
      throw new Error('Meeting date is required');
    }
    
    const { data, error } = await supabase
      .from('advisor_meetings')
      .insert([{
        ...mapToDbAdvisorMeeting(meeting),
        user_id: 1 // Hard-coded to user 1 for now
      }])
      .select()
      .single();

    if (error) {
      console.error('Error scheduling meeting:', error);
      throw error;
    }

    return await mapToAdvisorMeeting(data as DbAdvisorMeeting);
  },

  async cancelAdvisorMeeting(id: number): Promise<void> {
    const { error } = await supabase
      .from('advisor_meetings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error canceling meeting:', error);
      throw error;
    }
  }
};
