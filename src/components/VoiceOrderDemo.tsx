import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, ShoppingCart, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStep = 'idle' | 'recording' | 'processing' | 'reviewing' | 'confirmed';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifications?: string[];
}

interface Order {
  items: OrderItem[];
  total: number;
  specialInstructions?: string;
}

const mockTranscript = "Hi, I'd like to order two large margherita pizzas with extra cheese, one Caesar salad, and three Coca-Colas. Please make sure the pizzas are well done. That's for delivery to 123 Main Street.";

const mockOrder: Order = {
  items: [
    {
      id: '1',
      name: 'Large Margherita Pizza',
      quantity: 2,
      price: 18.99,
      modifications: ['Extra cheese', 'Well done']
    },
    {
      id: '2',
      name: 'Caesar Salad',
      quantity: 1,
      price: 12.50
    },
    {
      id: '3',
      name: 'Coca-Cola',
      quantity: 3,
      price: 2.99
    }
  ],
  total: 59.45,
  specialInstructions: 'Delivery to 123 Main Street'
};

export default function VoiceOrderDemo() {
  const [step, setStep] = useState<OrderStep>('idle');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setStep('recording');
    setIsRecording(true);
    setTranscript('');
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      setStep('processing');
      
      // Simulate processing
      setTimeout(() => {
        setTranscript(mockTranscript);
        setStep('reviewing');
      }, 2000);
    }, 3000);
  };

  const confirmOrder = () => {
    setStep('confirmed');
  };

  const resetDemo = () => {
    setStep('idle');
    setTranscript('');
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Voice-to-Order Demo
        </h1>
        <p className="text-muted-foreground text-lg">
          Experience AI-powered voice ordering with real-time processing
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Voice Recording Interface */}
        <Card className="p-8 text-center order-card">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Button
                onClick={startRecording}
                disabled={step !== 'idle'}
                size="lg"
                className={cn(
                  "w-24 h-24 rounded-full transition-all duration-300",
                  isRecording && "recording-indicator voice-pulse",
                  step === 'idle' ? "bg-gradient-to-br from-primary to-primary/80 hover:shadow-[var(--shadow-voice)]" : 
                  step === 'recording' ? "bg-red-500 hover:bg-red-600" : 
                  "bg-muted cursor-not-allowed"
                )}
              >
                {step === 'recording' ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </Button>
              
              {isRecording && (
                <div className="absolute -inset-4 rounded-full border-2 border-red-500 animate-pulse-ring opacity-60" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {step === 'idle' && 'Tap to Start Your Order'}
                {step === 'recording' && 'Listening... Speak clearly'}
                {step === 'processing' && 'Processing Your Order'}
                {step === 'reviewing' && 'Review Your Order'}
                {step === 'confirmed' && 'Order Confirmed!'}
              </h3>
              
              {step === 'recording' && (
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-8 bg-red-500 rounded-full voice-wave"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
              
              {step === 'processing' && (
                <div className="processing-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Transcript Display */}
        {transcript && (
          <Card className="p-6 order-card">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-2">Voice Transcript</h4>
                <p className="text-muted-foreground leading-relaxed">{transcript}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Summary */}
        {step === 'reviewing' && (
          <Card className="p-6 order-card">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-lg">Order Summary</h4>
            </div>
            
            <div className="space-y-4">
              {mockOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    {item.modifications && (
                      <div className="text-sm text-muted-foreground ml-6">
                        {item.modifications.join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              {mockOrder.specialInstructions && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Special Instructions:</strong> {mockOrder.specialInstructions}
                  </p>
                </div>
              )}
              
              <div className="pt-3 border-t flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${mockOrder.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={resetDemo} variant="outline" className="flex-1">
                Start Over
              </Button>
              <Button onClick={confirmOrder} className="flex-1 bg-gradient-to-r from-primary to-accent">
                Confirm Order
              </Button>
            </div>
          </Card>
        )}

        {/* Confirmation */}
        {step === 'confirmed' && (
          <Card className="p-8 text-center order-card bg-gradient-to-br from-accent/10 to-primary/10">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-accent">Order Confirmed!</h3>
                <p className="text-muted-foreground">
                  Your order has been processed and will be ready in 25-30 minutes
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Estimated delivery: 6:45 PM</span>
                </div>
              </div>
              
              <Button onClick={resetDemo} className="mt-4">
                Try Another Order
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2">
          {['idle', 'recording', 'processing', 'reviewing', 'confirmed'].map((s, index) => {
            const currentIndex = ['idle', 'recording', 'processing', 'reviewing', 'confirmed'].indexOf(step);
            const isActive = index <= currentIndex;
            return (
              <div
                key={s}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isActive ? "bg-primary" : "bg-muted"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}