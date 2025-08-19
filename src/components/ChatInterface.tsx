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
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Premium Header with Glassmorphism */}
      <header className="glass-card border-0 border-b border-border/20 p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/valonylabs-logo.png" alt="ValonyLabs" className="w-10 h-10 logo-glow" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                ValGro Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Chart Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="glass-card px-4 py-2 rounded-full flex items-center space-x-2">
              <Switch
                id="rag-mode"
                checked={useRAG}
                onCheckedChange={setUseRAG}
                className="data-[state=checked]:bg-primary scale-75"
              />
              <Label htmlFor="rag-mode" className="text-sm font-medium flex items-center">
                <Brain className="w-4 h-4 mr-1 text-primary" />
                RAG
              </Label>
            </div>
            
            {chatHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="glass-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
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
            <div className="flex items-center justify-center h-full text-center relative">
              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full floating-card"></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent/40 rounded-full floating-card" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary/20 rounded-full floating-card" style={{animationDelay: '4s'}}></div>
              </div>

              <div className="space-y-12 max-w-5xl relative z-10">
                {/* Hero Section */}
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="flex items-center justify-center space-x-6">
                    <img src="/valonylabs-logo.png" alt="ValonyLabs" className="w-16 h-16 logo-glow" />
                    <div>
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow">
                        ValonyLabs
                      </h1>
                      <p className="text-xl text-muted-foreground mt-2">Unlock insights from your data</p>
                    </div>
                  </div>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-primary mb-2">📊 Chart Analysis</h3>
                      <p className="text-sm text-muted-foreground">Discover patterns and trends</p>
                    </div>
                    <div
                      onClick={() => handleComboAction("Identify upward/downward trends")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <span className="text-primary font-bold">📈</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Trend Analysis</div>
                          <div className="text-sm text-muted-foreground">Identify market directions</div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => handleComboAction("Detect seasonal patterns")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                          <span className="text-accent font-bold">🔄</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Pattern Detection</div>
                          <div className="text-sm text-muted-foreground">Find seasonal cycles</div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => handleComboAction("Find data anomalies")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center group-hover:bg-destructive/30 transition-colors">
                          <span className="text-destructive font-bold">⚠️</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Anomaly Detection</div>
                          <div className="text-sm text-muted-foreground">Spot unusual data points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-accent mb-2">🔢 Numerical Insights</h3>
                      <p className="text-sm text-muted-foreground">Extract key metrics</p>
                    </div>
                    <div
                      onClick={() => handleComboAction("Find highest/lowest values")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <span className="text-primary font-bold">📏</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Peak Analysis</div>
                          <div className="text-sm text-muted-foreground">Find min/max values</div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => handleComboAction("Calculate averages")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                          <span className="text-accent font-bold">📊</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Statistical Summary</div>
                          <div className="text-sm text-muted-foreground">Compute averages</div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => handleComboAction("Identify correlations")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <span className="text-primary font-bold">🔗</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Correlation Analysis</div>
                          <div className="text-sm text-muted-foreground">Find relationships</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-primary mb-2">💼 Business Intelligence</h3>
                      <p className="text-sm text-muted-foreground">Strategic recommendations</p>
                    </div>
                    <div
                      onClick={() => handleComboAction("Strategic recommendations")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                          <span className="text-accent font-bold">🎯</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Strategy Insights</div>
                          <div className="text-sm text-muted-foreground">Business guidance</div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => handleComboAction("Future predictions")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <span className="text-primary font-bold">🔮</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Predictive Analysis</div>
                          <div className="text-sm text-muted-foreground">Future forecasts</div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => handleComboAction("Comparative analysis")}
                      className="action-button p-6 rounded-xl shimmer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                          <span className="text-accent font-bold">⚖️</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">Comparative Study</div>
                          <div className="text-sm text-muted-foreground">Side-by-side analysis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {chatHistory.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-4 animate-fade-in ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {msg.role === 'assistant' && (
                    <div className="ai-gradient w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-lg ${
                      msg.role === 'user'
                        ? 'ai-gradient text-white'
                        : 'glass-card'
                    }`}
                  >
                    <p className="leading-relaxed text-sm">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-3">
                      {format(msg.timestamp, 'HH:mm')}
                    </p>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="glass-card w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              
              {streamingMessage && (
                <div className="flex items-start space-x-4 justify-start animate-fade-in">
                  <div className="ai-gradient w-10 h-10 rounded-full flex items-center justify-center animate-glow">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl px-6 py-4 glass-card">
                    <p className="leading-relaxed text-sm">{streamingMessage}<span className="animate-pulse text-primary">|</span></p>
                  </div>
                </div>
              )}
              
              {isProcessing && !streamingMessage && (
                <div className="flex items-start space-x-4 justify-start animate-fade-in">
                  <div className="ai-gradient w-10 h-10 rounded-full flex items-center justify-center animate-glow">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="glass-card rounded-2xl px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                      <span className="text-sm text-muted-foreground">Analyzing your request...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {/* Premium Input Area */}
        <div className="p-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="chat-input relative flex items-center rounded-2xl p-2 group">
              <div className="flex items-center pl-4">
                <Mic className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-all duration-300 hover:scale-110" />
              </div>
              
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about your data..."
                disabled={isProcessing}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-5 text-base placeholder:text-muted-foreground/70"
              />
              
              <div className="flex items-center pr-2 space-x-2">
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isProcessing}
                  size="icon"
                  className="ai-gradient text-white hover:opacity-90 hover:scale-105 rounded-full w-12 h-12 shadow-lg transition-all duration-300 ai-glow"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Subtle border glow on focus */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};