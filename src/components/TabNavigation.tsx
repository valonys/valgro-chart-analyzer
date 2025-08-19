import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, MessageCircle, BarChart3, History } from 'lucide-react';
import { AppState } from '@/types/chart-analysis';

interface TabNavigationProps {
  currentTab: AppState['currentTab'];
  onTabChange: (tab: AppState['currentTab']) => void;
  hasUploadedImage: boolean;
  chatHistoryCount: number;
  analysisHistoryCount: number;
}

export const TabNavigation = ({ 
  currentTab, 
  onTabChange, 
  hasUploadedImage,
  chatHistoryCount,
  analysisHistoryCount 
}: TabNavigationProps) => {
  const tabs = [
    {
      id: 'upload' as const,
      label: 'Upload & Analyze',
      icon: Upload,
      badge: hasUploadedImage ? 'Ready' : null
    },
    {
      id: 'chat' as const,
      label: 'AI Chat',
      icon: MessageCircle,
      badge: chatHistoryCount > 0 ? chatHistoryCount : null
    },
    {
      id: 'analysis' as const,
      label: 'Results',
      icon: BarChart3,
      badge: analysisHistoryCount > 0 ? 'Available' : null
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: History,
      badge: analysisHistoryCount > 0 ? analysisHistoryCount : null
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row border-b border-border bg-card/50 backdrop-blur-sm">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={currentTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 justify-start sm:justify-center rounded-none border-0 relative h-12 px-6 ${
            currentTab === tab.id 
              ? 'ai-gradient text-white shadow-none' 
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          
          {tab.badge && (
            <Badge 
              variant="secondary" 
              className={`ml-1 text-xs h-5 ${
                currentTab === tab.id 
                  ? 'bg-white/20 text-white border-0' 
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {tab.badge}
            </Badge>
          )}
          
          {currentTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50"></div>
          )}
        </Button>
      ))}
    </div>
  );
};