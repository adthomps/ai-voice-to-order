import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, Layout, Layers3 } from 'lucide-react';

interface DemoSwitcherProps {
  currentVersion: 'simple' | 'enhanced';
  onVersionChange: (version: 'simple' | 'enhanced') => void;
}

export default function DemoSwitcher({ currentVersion, onVersionChange }: DemoSwitcherProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="p-4 max-w-md mx-auto mb-6 transition-all duration-300 hover:shadow-[var(--shadow-primary)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Demo Version</div>
          <div className="flex items-center space-x-2">
            <Badge variant={currentVersion === 'enhanced' ? 'default' : 'secondary'}>
              {currentVersion === 'enhanced' ? 'Enhanced UI' : 'Simple UI'}
            </Badge>
            <div className="flex items-center space-x-1">
              {currentVersion === 'enhanced' ? (
                <Layers3 className="w-3 h-3 text-primary" />
              ) : (
                <Layout className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {currentVersion === 'enhanced' 
              ? 'Real OpenAI processing with mock payments - backend configured'
              : 'All APIs mocked for quick demonstration'
            }
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-2">
          <ArrowLeftRight className={`w-4 h-4 transition-transform duration-300 ${
            isHovered ? 'rotate-180' : ''
          } text-primary`} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onVersionChange(currentVersion === 'simple' ? 'enhanced' : 'simple')}
            className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            Switch to {currentVersion === 'simple' ? 'Enhanced' : 'Simple'}
          </Button>
        </div>
      </div>
      
      {/* Feature Comparison */}
      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Voice Recording:</span>
            <span className="text-primary">✓ Both versions</span>
          </div>
          <div className="flex justify-between">
            <span>Text Input Fallback:</span>
            <span className="text-primary">✓ Both versions</span>
          </div>
          <div className="flex justify-between">
            <span>OpenAI Processing:</span>
            <span className={currentVersion === 'enhanced' ? 'text-primary' : 'text-muted-foreground'}>
              {currentVersion === 'enhanced' ? '✓ Real (backend)' : '○ Mock only'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Payment Processing:</span>
            <span className="text-muted-foreground">
              ○ Mock only (both)
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}