import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export const AppSidebar = ({ 
  selectedModel, 
  onModelSelect, 
  analysisCount, 
  chatCount, 
  isProcessing 
}: AppSidebarProps) => {
  return (
    <aside className="w-80 h-screen border-r border-border bg-card/30 p-6 space-y-6">
      {/* Logo */}
      <div className="flex items-center justify-center p-4">
        <img src="/valonylabs-logo.png" alt="ValonyLabs" className="w-16 h-16" />
      </div>

      {/* Model Selection */}
      <Card className="border-0 bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            AI Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedModel} 
            onValueChange={onModelSelect}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-background/80 transition-colors">
              <RadioGroupItem value="scout" id="scout" />
              <Label htmlFor="scout" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Scout</div>
                    <div className="text-sm text-muted-foreground">Detailed Analysis</div>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-background/80 transition-colors">
              <RadioGroupItem value="maverick" id="maverick" />
              <Label htmlFor="maverick" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Maverick</div>
                    <div className="text-sm text-muted-foreground">Enhanced Context</div>
                  </div>
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="border-0 bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Session Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-primary">{analysisCount}</div>
              <div className="text-sm text-muted-foreground">Analyses</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-primary">{chatCount}</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={isProcessing ? "secondary" : "default"} className="text-xs">
                {isProcessing ? 'Processing' : 'Ready'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};