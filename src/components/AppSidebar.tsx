import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles } from 'lucide-react';
import { AIModel } from '@/types/chart-analysis';
import { ValonyLabsLogo } from './ValonyLabsLogo';

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
    description: 'Llama 3.2 11B Vision - Fast and efficient chart analysis',
    tier: 'standard'
  },
  {
    id: 'maverick',
    name: 'Maverick',
    description: 'Llama 3.2 90B Vision - Advanced reasoning and detailed insights',
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
    <div className="w-80 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Clean Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <ValonyLabsLogo size={32} className="text-sidebar-foreground" />
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">ValGro</h2>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-6 flex-1">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-sidebar-foreground" />
            <h3 className="font-medium text-sidebar-foreground">AI Models</h3>
          </div>
          
          <div className="space-y-3">
            {models.map((model) => (
              <label
                key={model.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedModel.id === model.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={selectedModel.id === model.id}
                  onChange={() => onModelSelect(model)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedModel.id === model.id
                    ? 'border-sidebar-foreground bg-sidebar-foreground'
                    : 'border-muted-foreground'
                }`}>
                  {selectedModel.id === model.id && (
                    <div className="w-2 h-2 rounded-full bg-sidebar-background"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-sidebar-foreground">{model.name}</span>
                    <Badge 
                      variant={model.tier === 'premium' ? 'default' : 'secondary'}
                      className="text-xs px-2 py-0.5"
                    >
                      {model.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-t border-sidebar-border">
        <div className="space-y-4">
          <h3 className="font-medium text-sidebar-foreground text-sm">Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-sidebar-accent rounded-lg">
              <div className="text-xs text-muted-foreground">Analyses</div>
              <div className="text-lg font-semibold text-sidebar-foreground">{analysisCount}</div>
            </div>
            <div className="p-3 bg-sidebar-accent rounded-lg">
              <div className="text-xs text-muted-foreground">Messages</div>
              <div className="text-lg font-semibold text-sidebar-foreground">{chatCount}</div>
            </div>
          </div>
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border border-sidebar-foreground border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};