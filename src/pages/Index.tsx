import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';
import { useChartAnalysis } from '@/hooks/use-chart-analysis';
import { ChatInterface } from '@/components/ChatInterface';
import { AppSidebar } from '@/components/AppSidebar';

const Index = () => {
  const {
    selectedModel,
    chatHistory,
    analysisHistory,
    isProcessing,
    setSelectedModel,
    sendChatMessage,
    sendStreamingChatMessage,
    clearChatHistory
  } = useChartAnalysis();

  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 bg-background/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-2">
                <img src="/valonylabs-logo.png" alt="ValonyLabs" className="w-20 h-20" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">ValGro Analyzer</h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Chart Analysis
                </p>
              </div>
              
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Scout
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Maverick
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
        analysisCount={analysisHistory.length}
        chatCount={chatHistory.length}
        isProcessing={isProcessing}
      />
      
      <main className="flex-1">
        <ChatInterface
          chatHistory={chatHistory}
          selectedModel={selectedModel}
          isProcessing={isProcessing}
          onSendMessage={sendChatMessage}
          onStreamMessage={sendStreamingChatMessage}
          onClearHistory={clearChatHistory}
        />
      </main>
    </div>
  );
};

export default Index;
