import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Keyboard,
  Settings,
  CreditCard,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import VoiceRecorder from './VoiceRecorder';
import ApiKeyModal from './ApiKeyModal';
import { initializeOpenAI, transcribeAudio, parseOrderFromText, processTransaction, lookupCustomer } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

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

const mockTranscript = "Customer 12345, John, ordered 2 large coffees for $5 each and 1 blueberry muffin for $3.50. Please add extra foam to the coffees.";

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
      price: 5.00,
      modifications: ['Extra foam']
    },
    {
      id: '2',
      name: 'Blueberry Muffin',
      quantity: 1,
      price: 3.50
    }
  ],
  total: 13.50,
  transactionId: null,
  transactionStatus: null,
  cardType: null,
  specialInstructions: "Extra foam on coffees"
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
  const [textInput, setTextInput] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useRealApi, setUseRealApi] = useState(false);
  
  const { toast } = useToast();

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setStep('processing');
    setIsProcessing(true);
    setProgress(25);
    
    try {
      let transcribedText = '';
      
      if (useRealApi && hasApiKey) {
        // Real API processing
        toast({
          title: "Processing Audio",
          description: "Transcribing your voice using OpenAI...",
        });
        
        transcribedText = await transcribeAudio(audioBlob);
        setProgress(50);
        
        toast({
          title: "Parsing Order",
          description: "Extracting order details from transcript...",
        });
        
        const parsedOrder = await parseOrderFromText(transcribedText);
        setProgress(75);
        
        // Set extracted data
        setTranscript(transcribedText);
        setCustomerDetails(parsedOrder.customer || { name: null, id: null, email: null });
        setOrderDetails({
          items: parsedOrder.items || [],
          total: parsedOrder.total || 0,
          transactionId: null,
          transactionStatus: null,
          cardType: null,
          specialInstructions: parsedOrder.specialInstructions
        });
        
      } else {
        // Mock processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTranscript(mockTranscript);
        setProgress(50);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCustomerDetails(mockCustomerDetails);
        setOrderDetails(mockOrderDetails);
        setProgress(75);
      }
      
      setStep('reviewing');
      setProgress(100);
      
    } catch (error) {
      console.error('Voice processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process voice input. Please try again.",
        variant: "destructive"
      });
      setStep('idle');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    
    setStep('processing');
    setIsProcessing(true);
    setProgress(25);
    
    try {
      if (useRealApi && hasApiKey) {
        setTranscript(textInput);
        setProgress(50);
        
        const parsedOrder = await parseOrderFromText(textInput);
        setProgress(75);
        
        setCustomerDetails(parsedOrder.customer || { name: null, id: null, email: null });
        setOrderDetails({
          items: parsedOrder.items || [],
          total: parsedOrder.total || 0,
          transactionId: null,
          transactionStatus: null,
          cardType: null,
          specialInstructions: parsedOrder.specialInstructions
        });
      } else {
        // Mock processing
        setTranscript(textInput);
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCustomerDetails(mockCustomerDetails);
        setOrderDetails(mockOrderDetails);
        setProgress(75);
      }
      
      setStep('reviewing');
      setProgress(100);
    } catch (error) {
      console.error('Text processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process text input. Please try again.",
        variant: "destructive"
      });
      setStep('idle');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmOrder = async () => {
    setStep('processing');
    setIsProcessing(true);
    setProgress(85);
    
    try {
      // Process payment
      const transactionRequest = {
        amount: orderDetails.total,
        currency: 'USD',
        customerId: customerDetails.id || undefined,
        orderItems: orderDetails.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      const transactionResult = await processTransaction(transactionRequest);
      
      // Update order with transaction details
      setOrderDetails(prev => ({
        ...prev,
        transactionId: transactionResult.transactionId,
        transactionStatus: transactionResult.status,
        cardType: transactionResult.cardType ? `${transactionResult.cardType} ****${transactionResult.last4}` : null
      }));
      
      setProgress(100);
      setStep('confirmed');
      
      if (transactionResult.status === 'success') {
        toast({
          title: "Payment Successful",
          description: `Transaction ${transactionResult.transactionId} completed successfully.`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: "Transaction could not be processed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDemo = () => {
    setStep('idle');
    setTranscript('');
    setIsRecording(false);
    setProgress(0);
    setTextInput('');
    setUseTextInput(false);
    setCustomerDetails({ name: null, id: null, email: null });
    setOrderDetails({ items: [], total: 0, transactionId: null, transactionStatus: null, cardType: null });
  };

  const handleApiKeySubmit = (apiKey: string) => {
    initializeOpenAI(apiKey);
    setHasApiKey(true);
    setUseRealApi(true);
    toast({
      title: "API Key Configured",
      description: "Real voice processing is now enabled.",
    });
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
        
        {/* API Configuration and Demo Controls */}
        <Card className="p-4 max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Processing Mode</div>
              <div className="flex items-center space-x-2">
                <Badge variant={useRealApi ? "default" : "secondary"}>
                  {useRealApi ? "Real API" : "Demo Mode"}
                </Badge>
                {hasApiKey && <Badge variant="outline">OpenAI Connected</Badge>}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setApiKeyModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Configure API</span>
            </Button>
          </div>
          
          {!hasApiKey && (
            <div className="text-xs text-muted-foreground">
              Using simulated responses. Configure OpenAI API key for real voice processing.
            </div>
          )}
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
            
            {!useTextInput ? (
              <VoiceRecorder 
                onRecordingComplete={handleVoiceRecording}
                isProcessing={isProcessing}
                disabled={step !== 'idle'}
              />
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="textInput">Type your order:</Label>
                  <Textarea
                    id="textInput"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Example: Customer 12345, John, ordered 2 large coffees for $5 each and 1 blueberry muffin for $3.50"
                    rows={4}
                    disabled={step !== 'idle'}
                  />
                </div>
                <Button 
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || step !== 'idle' || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Order'
                  )}
                </Button>
              </div>
            )}

            {/* Switch Input Mode */}
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setUseTextInput(!useTextInput)}
                className="w-full"
                disabled={step !== 'idle'}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Switch to {useTextInput ? 'Voice' : 'Text'} Input
              </Button>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">
                  {useTextInput ? 'Input Text:' : 'Transcription:'}
                </div>
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
            
            {/* Payment Information */}
            {(orderDetails.transactionId || step === 'confirmed') && (
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center space-x-2 mb-3">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Payment Information</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction ID:</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {orderDetails.transactionId || 'Pending...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant={
                      orderDetails.transactionStatus === 'success' ? 'default' :
                      orderDetails.transactionStatus === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {orderDetails.transactionStatus || 'Pending'}
                    </Badge>
                  </div>
                  {orderDetails.cardType && (
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Method:</span>
                      <span className="text-muted-foreground">{orderDetails.cardType}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
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
                <Button 
                  onClick={confirmOrder} 
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
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
                <h3 className="text-2xl font-bold text-accent">
                  {orderDetails.transactionStatus === 'success' ? 'Order Confirmed!' : 'Order Received'}
                </h3>
                <p className="text-muted-foreground">
                  {orderDetails.transactionStatus === 'success' 
                    ? 'Payment processed successfully using Visa payment network'
                    : 'Order processed successfully using AI voice recognition'
                  }
                </p>
                {orderDetails.transactionId && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Transaction ID: {orderDetails.transactionId}
                  </p>
                )}
              </div>
              
              <Button onClick={resetDemo} className="mt-4">
                Place Another Order
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onApiKeySubmit={handleApiKeySubmit}
        hasApiKey={hasApiKey}
      />
    </div>
  );
}