import { useState } from 'react';
import EnhancedVoiceOrderDemo from '@/components/EnhancedVoiceOrderDemo';
import VoiceOrderDemo from '@/components/VoiceOrderDemo';
import DemoSwitcher from '@/components/DemoSwitcher';

const Index = () => {
  const [demoVersion, setDemoVersion] = useState<'simple' | 'enhanced'>('enhanced');

  return (
    <div>
      <DemoSwitcher 
        currentVersion={demoVersion} 
        onVersionChange={setDemoVersion}
      />
      {demoVersion === 'enhanced' ? (
        <EnhancedVoiceOrderDemo />
      ) : (
        <VoiceOrderDemo />
      )}
    </div>
  );
};

export default Index;
