import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Trash2, RefreshCw } from 'lucide-react';

export const DictionaryUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [dictionaries, setDictionaries] = useState<any[]>([]);
  const { toast } = useToast();

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
        body: { action: 'upload' }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Dictionary Uploaded",
          description: `Charlotte's lexicon uploaded successfully with ID: ${data.dictionaryId}`,
        });
      } else {
        throw new Error(data?.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleList = async () => {
    setIsListing(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
        body: { action: 'list' }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setDictionaries(data.dictionaries || []);
        toast({
          title: "Dictionaries Listed",
          description: `Found ${data.dictionaries?.length || 0} dictionaries`,
        });
      } else {
        throw new Error(data?.error || 'List failed');
      }
    } catch (error) {
      console.error('List error:', error);
      toast({
        title: "List Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsListing(false);
    }
  };

  const handleDelete = async (dictionaryId: string) => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
        body: { action: 'delete', dictionaryId }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Dictionary Deleted",
          description: "Dictionary removed successfully",
        });
        // Refresh the list
        await handleList();
      } else {
        throw new Error(data?.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Charlotte's Learning Lexicon Manager</CardTitle>
        <CardDescription>
          Upload and manage the pronunciation dictionary for enhanced learning mode TTS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Dictionary
          </Button>
          
          <Button 
            onClick={handleList} 
            disabled={isListing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isListing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            List Dictionaries
          </Button>
        </div>

        {dictionaries.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Existing Dictionaries:</h3>
            {dictionaries.map((dict) => (
              <div key={dict.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{dict.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {dict.id}</p>
                  {dict.description && (
                    <p className="text-sm text-muted-foreground">{dict.description}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleDelete(dict.id)}
                  disabled={isDeleting}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};