import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Bot, User, Trash2, Brain } from 'lucide-react';
import { ChatMessage, AIModel } from '@/types/chart-analysis';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  selectedModel: AIModel;
  isProcessing: boolean;
  onSendMessage: (message: string, useRAG: boolean) => void;
  onClearHistory: () => void;
}

export const ChatInterface = ({ 
  chatHistory, 
  selectedModel, 
  isProcessing, 
  onSendMessage, 
  onClearHistory 
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [useRAG, setUseRAG] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, useRAG);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col card-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
            AI Chat Assistant
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="ai-gradient text-white border-0">
              {selectedModel === 'scout' ? 'Scout' : 'Maverick'}
            </Badge>
            {chatHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="rag-mode"
            checked={useRAG}
            onCheckedChange={setUseRAG}
          />
          <Label htmlFor="rag-mode" className="text-sm">
            <Brain className="w-4 h-4 inline mr-1" />
            RAG Context Mode
          </Label>
          {useRAG && (
            <Badge variant="outline" className="text-xs">
              Enhanced Context
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          {chatHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center space-y-4">
              <div className="space-y-2">
                <div className="ai-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto ai-glow">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Start a Conversation</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask questions about your chart analysis or discuss insights with the AI assistant.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="ai-gradient w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ai-glow">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Chart reference"
                        className="mt-2 max-w-full h-32 object-contain rounded border"
                      />
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {format(msg.timestamp, 'HH:mm')}
                    </p>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex items-start space-x-3 justify-start">
                  <div className="ai-gradient w-8 h-8 rounded-full flex items-center justify-center animate-pulse-glow">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <Separator />
        
        <div className="p-4">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your chart analysis..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isProcessing}
              className="ai-gradient text-white hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};