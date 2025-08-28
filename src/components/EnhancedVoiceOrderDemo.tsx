import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  ShoppingCart, 
  Check, 
  User, 
  ChevronDown,
  ChevronUp,
  Info,
  MessageSquare,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStep = 'idle' | 'recording' | 'processing' | 'reviewing' | 'confirmed';

interface CustomerDetails {
  name: string | null;
  id: string | null;
  email: string | null;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifications?: string[];
}

interface OrderDetails {
  items: OrderItem[];
  total: number;
  transactionId: string | null;
  transactionStatus: string | null;
  cardType: string | null;
  specialInstructions?: string;
}

const mockTranscript = "Customer 12345, John, ordered 2 coffees for $5 each.";

const mockCustomerDetails: CustomerDetails = {
  name: "John Smith",
  id: "12345",
  email: "john.smith@email.com"
};

const mockOrderDetails: OrderDetails = {
  items: [
    {
      id: '1',
      name: 'Large Coffee',
      quantity: 2,
      price: 5.00
    }
  ],
  total: 10.00,
  transactionId: "TXN-2024-001",
  transactionStatus: "Completed",
  cardType: "Visa ****1234"
};

export default function EnhancedVoiceOrderDemo() {
  const [step, setStep] = useState<OrderStep>('idle');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: null,
    id: null,
    email: null
  });
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    items: [],
    total: 0,
    transactionId: null,
    transactionStatus: null,
    cardType: null
  });
  
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [explanationsOpen, setExplanationsOpen] = useState(false);
  const [useTextInput, setUseTextInput] = useState(false);

  const startRecording = () => {
    setStep('recording');
    setIsRecording(true);
    setTranscript('');
    setProgress(25);
    
    // Simulate 8-second recording
    setTimeout(() => {
      setIsRecording(false);
      setStep('processing');
      setProgress(50);
      
      // Simulate processing with transcript
      setTimeout(() => {
        setTranscript(mockTranscript);
        setProgress(75);
        
        // Extract customer and order details
        setTimeout(() => {
          setCustomerDetails(mockCustomerDetails);
          setOrderDetails(mockOrderDetails);
          setStep('reviewing');
          setProgress(100);
        }, 1000);
      }, 2000);
    }, 8000);
  };

  const confirmOrder = () => {
    setStep('confirmed');
  };

  const resetDemo = () => {
    setStep('idle');
    setTranscript('');
    setIsRecording(false);
    setProgress(0);
    setCustomerDetails({ name: null, id: null, email: null });
    setOrderDetails({ items: [], total: 0, transactionId: null, transactionStatus: null, cardType: null });
  };

  const getStepText = () => {
    switch (step) {
      case 'idle': return 'Ready to take your order';
      case 'recording': return 'Recording (8 seconds)';
      case 'processing': return 'Processing with AI';
      case 'reviewing': return 'Review extracted data';
      case 'confirmed': return 'Order confirmed';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Voice-to-Order AI Demo</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Experience the future of food ordering with AI-powered voice recognition. Speak naturally, and
          watch as our system converts your voice into a structured order.
        </p>
        
        {/* Demo Version Selector */}
        <Card className="p-4 max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Demo Version</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Current:</span>
                <Badge>Enhanced UI</Badge>
              </div>
              <div className="text-xs text-muted-foreground">Form-based layout with collapsible sections</div>
            </div>
            <Button variant="outline" size="sm">Switch</Button>
          </div>
        </Card>

        {/* Info Banner */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              This is a demo that simulates voice-to-text conversion and AI processing. If microphone access is denied, you can use the "Text Input Instead" option.
            </p>
          </div>
        </Card>
      </div>

      {/* Main Interface */}
      <div className="space-y-6">
        {/* Progress and Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Voice-Driven Order Processing</h2>
            <Badge variant={step === 'recording' ? 'destructive' : 'secondary'}>
              {step === 'recording' ? 'Recording' : getStepText()}
            </Badge>
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="text-sm text-muted-foreground">{getStepText()}</div>
        </Card>

        {/* Collapsible Instructions */}
        <Card className="p-6">
          <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-medium">Instructions</h3>
              {instructionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To use the voice input system, speak in the following format:
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm">
                    <strong>Example Order:</strong> "Customer 12345, John, ordered 2 coffees for $5 each."
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  The system will record for 8 seconds and from the audio extract details such as customer ID, name, and order items to process the order.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Collapsible Technical Explanations */}
        <Card className="p-6">
          <Collapsible open={explanationsOpen} onOpenChange={setExplanationsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-medium">Technical Explanations</h3>
              {explanationsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="space-y-4 text-sm">
                <div>
                  <strong className="text-primary">Speech-to-Text Transcription:</strong> The{' '}
                  <code className="bg-muted px-1 rounded text-pink-600">transcribeWithOpenAI</code>{' '}
                  function converts an audio file into text using OpenAI's speech-to-text API (whisper-1 model). This text is then used for further processing.
                </div>
                <div>
                  <strong className="text-primary">Text Parsing and Data Extraction:</strong> The{' '}
                  <code className="bg-muted px-1 rounded text-pink-600">parseWithOpenAI</code>{' '}
                  function extracts structured data (like Customer ID, Customer Name, Ordered Items, and Total Amount) from the transcribed text using OpenAI's GPT model (gpt-4o-mini). The data is returned as a JSON object.
                </div>
                <div>
                  <strong className="text-primary">Text-to-Speech:</strong> The{' '}
                  <code className="bg-muted px-1 rounded text-pink-600">speakText</code>{' '}
                  function converts text into spoken audio using OpenAI's text-to-speech API (tts-1 model). The audio is then played back to the user.
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Input Section */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">Voice Input</h3>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Press the microphone button and speak your order clearly.
              </p>
              <p className="text-xs text-muted-foreground">
                If microphone access is denied, use the fallback text input option.
              </p>
              
              {/* Microphone Access Instructions */}
              <Card className="p-4 bg-muted/50">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-left">
                    <div className="font-medium mb-1">To use voice input:</div>
                    <ol className="space-y-1 text-muted-foreground">
                      <li>1. Click the microphone icon in your browser's address bar</li>
                      <li>2. Select "Allow" for microphone access</li>
                      <li>3. Refresh the page if needed</li>
                    </ol>
                  </div>
                </div>
              </Card>

              {/* Microphone Button */}
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={startRecording}
                  disabled={step !== 'idle'}
                  size="lg"
                  className={cn(
                    "w-20 h-20 rounded-full transition-all duration-300",
                    isRecording && "recording-indicator voice-pulse",
                    step === 'idle' ? "bg-gradient-to-br from-primary to-primary/80 hover:shadow-[var(--shadow-voice)]" : 
                    step === 'recording' ? "bg-red-500 hover:bg-red-600" : 
                    "bg-muted cursor-not-allowed"
                  )}
                >
                  {step === 'recording' ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </Button>
                
                {step === 'idle' && (
                  <div className="text-sm text-muted-foreground">Microphone access denied</div>
                )}
              </div>

              {/* Text Input Fallback */}
              <Button 
                variant="outline" 
                onClick={() => setUseTextInput(!useTextInput)}
                className="w-full"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Use Text Input Instead
              </Button>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Transcription:</div>
                <div className="text-sm text-muted-foreground">{transcript}</div>
              </div>
            )}
          </Card>

          {/* Customer Details Section */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">Customer Details</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm text-muted-foreground">
                  {customerDetails.name || 'No data'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">ID:</span>
                <span className="text-sm text-muted-foreground">
                  {customerDetails.id || 'No data'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-muted-foreground">
                  {customerDetails.email || 'No data'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Details Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium">Order Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Items:</div>
              {orderDetails.items.length > 0 ? (
                <div className="space-y-2">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No items yet...</div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Transaction ID:</span>
                <span className="text-muted-foreground">{orderDetails.transactionId || 'No data'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Transaction Status:</span>
                <span className="text-muted-foreground">{orderDetails.transactionStatus || 'No data'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Card Type:</span>
                <span className="text-muted-foreground">{orderDetails.cardType || 'No data'}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                ${orderDetails.total.toFixed(2)}
              </span>
            </div>
            
            {step === 'reviewing' && (
              <div className="flex space-x-3 pt-4">
                <Button onClick={resetDemo} variant="outline" className="flex-1">
                  Start Over
                </Button>
                <Button onClick={confirmOrder} className="flex-1">
                  Confirm Order
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Confirmation */}
        {step === 'confirmed' && (
          <Card className="p-8 text-center bg-gradient-to-br from-accent/10 to-primary/10">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-accent">Order Confirmed!</h3>
                <p className="text-muted-foreground">
                  Order processed successfully using AI voice recognition
                </p>
              </div>
              
              <Button onClick={resetDemo} className="mt-4">
                Try Another Order
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}