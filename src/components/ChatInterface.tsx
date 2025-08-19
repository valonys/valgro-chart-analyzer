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
  onStreamMessage: (message: string, useRAG: boolean, onToken: (token: string) => void) => void;
  onClearHistory: () => void;
}

export const ChatInterface = ({ 
  chatHistory, 
  selectedModel, 
  isProcessing, 
  onSendMessage,
  onStreamMessage, 
  onClearHistory 
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [useRAG, setUseRAG] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (message.trim()) {
      setStreamingMessage('');
      onStreamMessage(message, useRAG, (token: string) => {
        setStreamingMessage(prev => prev + token);
      });
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
    <div className="h-screen flex flex-col bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="ai-gradient w-8 h-8 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold">AI Chat</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="rag-mode"
                checked={useRAG}
                onCheckedChange={setUseRAG}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="rag-mode" className="text-sm font-medium">
                <Brain className="w-3 h-3 inline mr-1" />
                RAG
              </Label>
            </div>
            
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
      </header>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          {chatHistory.length === 0 && !streamingMessage ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4 max-w-md">
                <div className="ai-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Start Your Analysis</h2>
                <p className="text-muted-foreground">
                  Ask questions about charts, data patterns, or get insights from your visualizations.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="ai-gradient w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 border border-border/50'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-2">
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
              
              {streamingMessage && (
                <div className="flex items-start space-x-3 justify-start">
                  <div className="ai-gradient w-8 h-8 rounded-full flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-muted/50 border border-border/50">
                    <p className="leading-relaxed">{streamingMessage}<span className="animate-pulse">|</span></p>
                  </div>
                </div>
              )}
              
              {isProcessing && !streamingMessage && (
                <div className="flex items-start space-x-3 justify-start">
                  <div className="ai-gradient w-8 h-8 rounded-full flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t border-border/50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about charts and data..."
                disabled={isProcessing}
                className="flex-1 rounded-full border-border/50 focus:border-primary bg-background/50 backdrop-blur-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isProcessing}
                className="ai-gradient text-white hover:opacity-90 rounded-full px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};