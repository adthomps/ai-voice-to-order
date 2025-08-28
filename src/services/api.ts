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
  // For enhanced mode, assume OpenAI is configured on backend
  // In a real implementation, this would make an API call to your backend
  // which would then call OpenAI with the server-side API key
  
  // For now, we'll simulate this with a mock response since we don't have a backend
  await new Promise(resolve => setTimeout(resolve, 2000));
  return "Mock transcription: Customer 12345, John, ordered 2 large coffees for $5 each and 1 blueberry muffin for $3.50. Please add extra foam to the coffees.";
};

export const parseOrderFromText = async (text: string): Promise<any> => {
  // For enhanced mode, assume OpenAI is configured on backend
  // In a real implementation, this would make an API call to your backend
  // which would then call OpenAI with the server-side API key
  
  // For now, we'll simulate this with a mock response since we don't have a backend
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    customer: {
      name: "John Smith",
      id: "12345",
      email: "john.smith@email.com"
    },
    items: [
      {
        id: "1",
        name: "Large Coffee",
        quantity: 2,
        price: 5.00,
        modifications: ["Extra foam"]
      },
      {
        id: "2",
        name: "Blueberry Muffin",
        quantity: 1,
        price: 3.50
      }
    ],
    total: 13.50,
    specialInstructions: "Extra foam on coffees"
  };
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