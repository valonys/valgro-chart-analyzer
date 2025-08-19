import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, BarChart3, Clock, Trash2, FileText } from 'lucide-react';
import { Analysis } from '@/types/chart-analysis';
import { format } from 'date-fns';

interface HistoryViewProps {
  analysisHistory: Analysis[];
  onClearHistory: () => void;
  onSelectAnalysis: (analysis: Analysis) => void;
}

export const HistoryView = ({ 
  analysisHistory, 
  onClearHistory, 
  onSelectAnalysis 
}: HistoryViewProps) => {
  if (analysisHistory.length === 0) {
    return (
      <Card className="card-shadow">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <History className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Analysis History</h3>
              <p className="text-muted-foreground">
                Your chart analyses will appear here once you start analyzing charts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2 text-primary" />
            Analysis History
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {analysisHistory.length} Analyses
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {analysisHistory.map((analysis, index) => (
              <Card 
                key={analysis.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border border-border/50 hover:border-primary/30"
                onClick={() => onSelectAnalysis(analysis)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">
                          Analysis #{analysisHistory.length - index}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={
                            analysis.model === 'scout' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }
                        >
                          {analysis.model === 'scout' ? 'Scout' : 'Maverick'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(analysis.timestamp, 'MMM dd, HH:mm')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <img
                        src={analysis.imageUrl}
                        alt="Analyzed chart"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {analysis.results.length} insights generated
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {analysis.results[0]?.answer.substring(0, 100)}...
                        </p>
                        
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(
                              (analysis.results.reduce((acc, r) => acc + (r.confidence || 0), 0) / 
                               analysis.results.length) * 100
                            )}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};