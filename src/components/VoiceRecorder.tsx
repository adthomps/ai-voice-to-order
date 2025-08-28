import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Square, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isProcessing, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startRecording = async () => {
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start duration counter
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Voice Recording</h3>
          <p className="text-sm text-muted-foreground">
            {hasPermission === false 
              ? 'Microphone access denied. Please enable microphone permissions.'
              : 'Click the microphone to start recording your order'
            }
          </p>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording: {formatDuration(duration)}</span>
          </div>
        )}

        {/* Microphone Button */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing || hasPermission === false}
            size="lg"
            className={cn(
              "w-20 h-20 rounded-full transition-all duration-300",
              isRecording && "bg-red-500 hover:bg-red-600 recording-indicator voice-pulse",
              !isRecording && hasPermission !== false && "bg-primary hover:bg-primary/90 hover:shadow-[var(--shadow-voice)]",
              (disabled || isProcessing || hasPermission === false) && "bg-muted cursor-not-allowed"
            )}
          >
            {isRecording ? (
              <Square className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground">
            {isRecording ? 'Click to stop recording' : 
             hasPermission === false ? 'Microphone access required' :
             'Click to start recording'}
          </div>
        </div>

        {/* Audio Playback */}
        {audioURL && !isRecording && (
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recorded Audio</span>
              <audio controls src={audioURL} className="w-48 h-8">
                Your browser does not support the audio element.
              </audio>
            </div>
          </Card>
        )}

        {/* Permission Request */}
        {hasPermission === false && (
          <Button onClick={checkMicrophonePermission} variant="outline">
            Request Microphone Access
          </Button>
        )}
      </div>
    </Card>
  );
}