import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Analysis } from '@/types/chart-analysis';
import { format } from 'date-fns';

interface AnalysisDisplayProps {
  analysis?: Analysis;
  isProcessing: boolean;
}

export const AnalysisDisplay = ({ analysis, isProcessing }: AnalysisDisplayProps) => {
  if (isProcessing) {
    return (
      <Card className="card-shadow animate-pulse-glow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Analyzing Chart...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="ai-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto ai-glow">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">AI Processing in Progress</h3>
                <p className="text-muted-foreground">
                  Our advanced vision models are analyzing your chart...
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                "Identifying chart type and structure",
                "Extracting data points and trends",
                "Analyzing patterns and anomalies",
                "Generating insights and recommendations"
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="card-shadow">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Analysis Yet</h3>
              <p className="text-muted-foreground">
                Upload a chart and run analysis to see detailed insights here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageConfidence = analysis.results.reduce((acc, result) => acc + (result.confidence || 0), 0) / analysis.results.length;

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Analysis Results
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="ai-gradient text-white border-0">
              {analysis.model === 'scout' ? 'Scout' : 'Maverick'}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {format(analysis.timestamp, 'HH:mm')}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Analysis Confidence</span>
            <span className="font-medium">{Math.round(averageConfidence * 100)}%</span>
          </div>
          <Progress value={averageConfidence * 100} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {analysis.results.map((result, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {(result.confidence || 0) > 0.8 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{result.question}</h4>
                      {result.confidence && (
                        <Badge 
                          variant={result.confidence > 0.8 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {Math.round(result.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.answer}
                    </p>
                  </div>
                </div>
                
                {index < analysis.results.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <Separator className="my-4" />
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Analysis completed using {analysis.model === 'scout' ? 'Llama-4 Scout' : 'Llama-4 Maverick'} • 
            {analysis.results.length} insights generated
          </p>
        </div>
      </CardContent>
    </Card>
  );
};