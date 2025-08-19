import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, X } from 'lucide-react';
import { UploadedImage } from '@/types/chart-analysis';

interface ImageUploadProps {
  uploadedImage?: UploadedImage;
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  isProcessing: boolean;
  onAnalyze: () => void;
}

export const ImageUpload = ({ 
  uploadedImage, 
  onImageUpload, 
  onImageRemove, 
  isProcessing, 
  onAnalyze 
}: ImageUploadProps) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      {!uploadedImage ? (
        <Card className="border-dashed border-2 border-primary/30 hover:border-primary/50 transition-colors card-shadow">
          <CardContent className="p-8">
            <div
              className="text-center space-y-4 cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="ai-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto ai-glow">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Upload Your Chart</h3>
                <p className="text-muted-foreground">
                  Drag & drop your chart image here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, JPEG, and PNG files
                </p>
              </div>
              <Button asChild className="ai-gradient text-white hover:opacity-90">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Image className="w-4 h-4 mr-2" />
                  Choose File
                </label>
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Image className="w-5 h-5 mr-2 text-primary" />
                  Uploaded Chart
                </h3>
                {onImageRemove && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onImageRemove}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="relative">
                <img
                  src={uploadedImage.url}
                  alt="Uploaded chart"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onAnalyze}
                  disabled={isProcessing}
                  className="ai-gradient text-white hover:opacity-90 flex-1"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Start Analysis'
                  )}
                </Button>
                
                <Button asChild variant="outline" className="flex-1">
                  <label htmlFor="file-upload-replace" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Replace Image
                  </label>
                </Button>
                <input
                  id="file-upload-replace"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};