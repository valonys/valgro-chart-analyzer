import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Eye, EyeOff } from 'lucide-react';
import { aiService } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyInputProps {
  onApiKeySet: () => void;
}

export const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Groq API key",
        variant: "destructive"
      });
      return;
    }

    // Set the API key in the service
    aiService.setApiKey(apiKey.trim());
    
    // Store in localStorage for persistence (note: this is not the most secure approach for production)
    localStorage.setItem('groq_api_key', apiKey.trim());
    
    toast({
      title: "API Key Set",
      description: "Groq API key configured successfully"
    });
    
    onApiKeySet();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Key className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>Configure Groq API</CardTitle>
          <CardDescription>
            Enter your Groq API key to enable real AI-powered chart analysis with vision capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Groq API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Groq Console</a></p>
              <p>• Enables Scout (Llama 3.2 11B) and Maverick (Llama 3.2 90B) vision models</p>
              <p>• Your key is stored locally and never sent to our servers</p>
            </div>
            
            <Button type="submit" className="w-full">
              Set API Key & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};