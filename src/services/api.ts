import OpenAI from 'openai';

// Mock API for transaction processing
export interface TransactionRequest {
  amount: number;
  currency?: string;
  customerId?: string;
  orderItems: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface TransactionResponse {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  timestamp: string;
  cardType?: string;
  last4?: string;
}

// Mock transaction processing
export const processTransaction = async (request: TransactionRequest): Promise<TransactionResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate occasional failures (10% chance)
  const success = Math.random() > 0.1;
  
  return {
    transactionId,
    status: success ? 'success' : 'failed',
    amount: request.amount,
    currency: request.currency || 'USD',
    timestamp: new Date().toISOString(),
    cardType: success ? 'Visa' : undefined,
    last4: success ? '1234' : undefined,
  };
};

// OpenAI Integration for Voice Processing
let openaiClient: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string) => {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Only for demo purposes
  });
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please provide API key.');
  }

  try {
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    
    const transcription = await openaiClient.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
};

export const parseOrderFromText = async (text: string): Promise<any> => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please provide API key.');
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts structured order data from voice transcripts. 
          Extract customer details, order items, and any special instructions from the provided text.
          Return a JSON object with the following structure:
          {
            "customer": {
              "name": "string or null",
              "id": "string or null",
              "email": "string or null"
            },
            "items": [
              {
                "id": "generated_id",
                "name": "item_name",
                "quantity": number,
                "price": number,
                "modifications": ["array", "of", "modifications"]
              }
            ],
            "total": number,
            "specialInstructions": "string or null"
          }
          
          If information is not available, use null. Generate reasonable prices if not mentioned.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Parsing error:', error);
    throw new Error('Failed to parse order from text');
  }
};

// Mock customer lookup
export const lookupCustomer = async (customerId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockCustomers: Record<string, any> = {
    '12345': {
      id: '12345',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      address: '123 Main Street, Anytown, ST 12345'
    },
    '67890': {
      id: '67890',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0456',
      address: '456 Oak Avenue, Somewhere, ST 67890'
    }
  };
  
  return mockCustomers[customerId] || null;
};