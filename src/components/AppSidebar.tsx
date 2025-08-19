import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles } from 'lucide-react';
import { AIModel } from '@/types/chart-analysis';

interface AppSidebarProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
  analysisCount: number;
  chatCount: number;
  isProcessing: boolean;
}

const models: AIModel[] = [
  {
    id: 'scout',
    name: 'Scout',
    description: 'Detailed analysis with comprehensive insights',
    tier: 'standard'
  },
  {
    id: 'maverick',
    name: 'Maverick',
    description: 'Enhanced context with advanced reasoning',
    tier: 'premium'
  }
];

export const AppSidebar = ({ 
  selectedModel, 
  onModelSelect, 
  analysisCount, 
  chatCount, 
  isProcessing 
}: AppSidebarProps) => {
  return (
    <div className="w-80 h-screen glass-card border-r border-sidebar-border flex flex-col relative overflow-hidden">
      {/* Premium Header */}
      <div className="p-6 border-b border-sidebar-border/50 relative">
        <div className="flex items-center space-x-3">
          <img src="/valonylabs-logo.png" alt="ValonyLabs" className="w-10 h-10 logo-glow" />
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ValGro</h2>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Premium Model Selection */}
      <div className="p-6 flex-1">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-sidebar-foreground">AI Models</h3>
          </div>
          
          <div className="space-y-3">
            {models.map((model, index) => (
              <label
                key={model.id}
                className={`group flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  selectedModel.id === model.id
                    ? 'glass-card ring-2 ring-primary/50'
                    : 'glass-card hover:bg-sidebar-accent/30'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={selectedModel.id === model.id}
                  onChange={() => onModelSelect(model)}
                  className="sr-only"
                />
                <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  selectedModel.id === model.id
                    ? 'border-primary bg-primary shadow-lg'
                    : 'border-muted-foreground group-hover:border-primary/50'
                }`}>
                  {selectedModel.id === model.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-scale-in"></div>
                  )}
                  {selectedModel.id === model.id && (
                    <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm text-sidebar-foreground">{model.name}</span>
                    <Badge 
                      variant={model.tier === 'premium' ? 'default' : 'secondary'}
                      className={`text-xs px-2 py-1 ${
                        model.tier === 'premium' 
                          ? 'ai-gradient text-white border-0' 
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {model.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{model.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Stats Dashboard */}
      <div className="p-6 border-t border-sidebar-border/50">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-xs">📊</span>
            </div>
            <h3 className="font-semibold text-sidebar-foreground text-sm">Activity Dashboard</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 rounded-xl group hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">Analyses</div>
              <div className="text-2xl font-bold text-primary">{analysisCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Total completed</div>
            </div>
            <div className="glass-card p-4 rounded-xl group hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">Messages</div>
              <div className="text-2xl font-bold text-accent">{chatCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Conversations</div>
            </div>
          </div>
          
          {isProcessing && (
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <div>
                  <div className="text-xs font-medium text-sidebar-foreground">AI Processing</div>
                  <div className="text-xs text-muted-foreground">Analyzing your request...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};