
import { useState } from 'react';
import { Advisor } from '@/types';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Define types for chat messages
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

interface AdvisorChatProps {
  advisor: Advisor;
}

const AdvisorChat = ({ advisor }: AdvisorChatProps) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'advisor',
      text: `Hello! I'm ${advisor.name}. How can I help you with your financial planning today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !advisor) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: chatMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const newConvoMessage: ConversationMessage = { role: 'user', content: chatMessage.trim() };
    const updatedConversationHistory = [...conversationHistory, newConvoMessage];
    setConversationHistory(updatedConversationHistory);
    
    const currentMessage = chatMessage.trim();
    setChatMessage('');
    setChatLoading(true);
    
    try {
      // Add system message about the advisor context for better AI responses
      const systemContext = `You are ${advisor.name}, a financial advisor specializing in ${advisor.expertise}. Provide helpful, professional financial advice.`;
      
      console.log("Sending chat request with messages:", JSON.stringify([
        { role: 'system', content: systemContext },
        ...updatedConversationHistory
      ]));
      
      const response = await fetch('https://uocqgeahfighgfnkwhyw.supabase.co/functions/v1/advisor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY3FnZWFoZmlnaGdmbmt3aHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzMjk2MDAsImV4cCI6MjAyMDkwNTYwMH0.m7pxBg5hdVpa6JseSgyqcJeDqKrWEnWPzK4LU9A2oTw'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemContext },
            ...updatedConversationHistory
          ]
        }),
      });
      
      if (!response.ok) {
        console.error(`API responded with status: ${response.status}`);
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        // Fallback response in case of unexpected API response format
        const fallbackResponse: ChatMessage = {
          id: Date.now() + 1,
          sender: 'advisor',
          text: `As ${advisor.name}, I'm here to help with your ${advisor.expertise.toLowerCase()} needs. Could you please try again with your question?`,
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, fallbackResponse]);
        return;
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
        text: `I apologize for the technical difficulties. As ${advisor.name}, I'd be happy to continue our conversation shortly.`,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
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
          placeholder={`Message ${advisor.name.split(' ')[0]}...`}
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
    </div>
  );
};

export default AdvisorChat;
