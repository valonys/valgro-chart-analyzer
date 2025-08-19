import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useChartAnalysis } from '@/hooks/use-chart-analysis';
import { TabNavigation } from '@/components/TabNavigation';
import { ImageUpload } from '@/components/ImageUpload';
import { ModelSelector } from '@/components/ModelSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { AnalysisDisplay } from '@/components/AnalysisDisplay';
import { HistoryView } from '@/components/HistoryView';

const Index = () => {
  const {
    currentTab,
    selectedModel,
    uploadedImage,
    chatHistory,
    analysisHistory,
    isProcessing,
    currentAnalysis,
    setCurrentTab,
    setSelectedModel,
    uploadImage,
    analyzeChart,
    sendChatMessage,
    clearChatHistory,
    clearAnalysisHistory
  } = useChartAnalysis();

  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleRemoveImage = () => {
    if (uploadedImage?.url) {
      URL.revokeObjectURL(uploadedImage.url);
    }
  };

  const handleSelectAnalysis = (analysis: any) => {
    setCurrentTab('analysis');
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl card-shadow animate-pulse-glow">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="ai-gradient w-24 h-24 rounded-full flex items-center justify-center mx-auto ai-glow">
                <Bot className="h-12 w-12 text-white" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold ai-gradient bg-clip-text text-transparent">
                  AI Chart Analyzer
                </h1>
                <p className="text-xl text-muted-foreground">
                  Powered by Advanced Vision Language Models
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Llama-4 Scout
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Llama-4 Maverick
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  RAG Enhanced
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Loading advanced AI capabilities...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="ai-gradient w-10 h-10 rounded-lg flex items-center justify-center ai-glow">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Chart Analyzer</h1>
                <p className="text-sm text-muted-foreground">Advanced Vision Language Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="hidden sm:flex">
                Model: {selectedModel === 'scout' ? 'Scout' : 'Maverick'}
              </Badge>
              {analysisHistory.length > 0 && (
                <Badge variant="secondary">
                  {analysisHistory.length} Analyses
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        hasUploadedImage={!!uploadedImage}
        chatHistoryCount={chatHistory.length}
        analysisHistoryCount={analysisHistory.length}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {currentTab === 'upload' && (
              <>
                <ImageUpload
                  uploadedImage={uploadedImage}
                  onImageUpload={uploadImage}
                  onImageRemove={handleRemoveImage}
                  isProcessing={isProcessing}
                  onAnalyze={analyzeChart}
                />
                
                {currentAnalysis && (
                  <>
                    <Separator />
                    <AnalysisDisplay 
                      analysis={currentAnalysis} 
                      isProcessing={isProcessing} 
                    />
                  </>
                )}
              </>
            )}
            
            {currentTab === 'chat' && (
              <ChatInterface
                chatHistory={chatHistory}
                selectedModel={selectedModel}
                isProcessing={isProcessing}
                onSendMessage={sendChatMessage}
                onClearHistory={clearChatHistory}
              />
            )}
            
            {currentTab === 'analysis' && (
              <AnalysisDisplay 
                analysis={currentAnalysis} 
                isProcessing={isProcessing} 
              />
            )}
            
            {currentTab === 'history' && (
              <HistoryView
                analysisHistory={analysisHistory}
                onClearHistory={clearAnalysisHistory}
                onSelectAnalysis={handleSelectAnalysis}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ModelSelector
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
            
            {/* Quick Stats */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-primary">{analysisHistory.length}</div>
                    <div className="text-xs text-muted-foreground">Analyses</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-primary">{chatHistory.length}</div>
                    <div className="text-xs text-muted-foreground">Messages</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Usage</span>
                    <span className="font-medium capitalize">{selectedModel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <Badge variant={isProcessing ? "secondary" : "default"} className="text-xs">
                      {isProcessing ? 'Processing' : 'Ready'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
