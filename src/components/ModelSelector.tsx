import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Cpu, Zap } from 'lucide-react';
import { AIModel } from '@/types/chart-analysis';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

export const ModelSelector = ({ selectedModel, onModelSelect }: ModelSelectorProps) => {
  const models = [
    {
      id: 'scout' as AIModel,
      name: 'Llama-4 Scout',
      description: 'Advanced vision-language model for detailed chart analysis',
      features: ['17B Parameters', 'High Accuracy', 'Detailed Analysis'],
      icon: Bot,
      color: 'bg-blue-500'
    },
    {
      id: 'maverick' as AIModel,
      name: 'Llama-4 Maverick',
      description: 'Enhanced context understanding with superior reasoning',
      features: ['17B Parameters', 'Enhanced Context', 'Superior Reasoning'],
      icon: Zap,
      color: 'bg-purple-500'
    }
  ];

  return (
    <Card className="card-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Select AI Model</h3>
          </div>
          
          <div className="grid gap-4">
            {models.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                onClick={() => onModelSelect(model.id)}
                className={`h-auto p-4 justify-start ${
                  selectedModel === model.id 
                    ? 'ai-gradient text-white border-0 ai-glow' 
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`p-2 rounded-lg ${
                    selectedModel === model.id ? 'bg-white/20' : model.color
                  }`}>
                    <model.icon className={`w-4 h-4 ${
                      selectedModel === model.id ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  
                  <div className="flex-1 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{model.name}</h4>
                      {selectedModel === model.id && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      selectedModel === model.id 
                        ? 'text-white/80' 
                        : 'text-muted-foreground'
                    }`}>
                      {model.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((feature, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className={`text-xs ${
                            selectedModel === model.id
                              ? 'bg-white/10 text-white/90 border-0'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Model Information:</p>
            <p>Both models use advanced vision-language processing for comprehensive chart analysis with real-time streaming capabilities.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};