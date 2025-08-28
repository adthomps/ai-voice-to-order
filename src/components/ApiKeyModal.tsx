import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Key, AlertTriangle, CheckCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySubmit: (apiKey: string) => void;
  hasApiKey: boolean;
}

export default function ApiKeyModal({ isOpen, onClose, onApiKeySubmit, hasApiKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
      setApiKey('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-primary" />
            <span>OpenAI API Configuration</span>
          </DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable real voice-to-text processing.
          </DialogDescription>
        </DialogHeader>

        {hasApiKey ? (
          <Card className="p-4 bg-accent/10 border-accent/20">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <div>
                <div className="font-medium text-accent">API Key Configured</div>
                <div className="text-sm text-muted-foreground">
                  Real voice processing is enabled
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <div className="font-medium mb-1">Demo Mode Active</div>
                  <div>Without an API key, the system will use simulated responses.</div>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="font-mono"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {showKey ? 'Hide' : 'Show'} API key
                </button>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Get API key →
                </a>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Use Demo Mode
              </Button>
              <Button type="submit" disabled={!apiKey.trim()} className="flex-1">
                Save API Key
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}