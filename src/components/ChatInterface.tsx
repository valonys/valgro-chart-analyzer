import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User, Trash2, Brain, Mic } from 'lucide-react';
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

  const handleComboAction = (value: string) => {
    if (value) {
      setMessage(value);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background font-['Tw_Cen_MT']">
      {/* Minimal Header */}
      <header className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/valonylabs-logo.png" alt="ValonyLabs" className="w-8 h-8" />
            <h1 className="text-xl font-semibold">ValGro Analyzer</h1>
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
              <div className="space-y-6 max-w-lg">
                <div className="flex justify-center mb-6">
                  <img src="/valonylabs-logo.png" alt="ValonyLabs" className="w-32 h-32" />
                </div>
                
                <div className="grid gap-3">
                  <select 
                    onChange={(e) => handleComboAction(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Analyze chart trends and patterns</option>
                    <option value="Identify upward/downward trends">Identify upward/downward trends</option>
                    <option value="Detect seasonal patterns">Detect seasonal patterns</option>
                    <option value="Find data anomalies">Find data anomalies</option>
                  </select>
                  
                  <select 
                    onChange={(e) => handleComboAction(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Extract numerical insights</option>
                    <option value="Find highest/lowest values">Find highest/lowest values</option>
                    <option value="Calculate averages">Calculate averages</option>
                    <option value="Identify correlations">Identify correlations</option>
                  </select>
                  
                  <select 
                    onChange={(e) => handleComboAction(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Generate business insights</option>
                    <option value="Strategic recommendations">Strategic recommendations</option>
                    <option value="Future predictions">Future predictions</option>
                    <option value="Comparative analysis">Comparative analysis</option>
                  </select>
                </div>
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
        <div className="p-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
              <div className="flex items-center pl-4">
                <Mic className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
              
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                disabled={isProcessing}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-4 text-base placeholder:text-muted-foreground/70"
              />
              
              <div className="flex items-center pr-2 space-x-2">
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isProcessing}
                  size="icon"
                  className="ai-gradient text-white hover:opacity-90 rounded-full w-10 h-10 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};