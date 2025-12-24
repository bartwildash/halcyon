// Mock Utility Registry
// In a real app, this might connect to a backend or device API

export const utilities = [
  {
    id: 'scan-nfc',
    name: 'Scan NFC',
    provider: 'device',
    category: 'capture',
    icon: '📡',
    invoke: async () => {
      console.log('Invoking NFC Scan...');
      await new Promise(r => setTimeout(r, 1000));
      return { tagId: 'mock-tag-' + Math.floor(Math.random() * 1000) };
    },
  },
  {
    id: 'make-payment',
    name: 'Make Payment',
    provider: 'adyen',
    category: 'transact',
    icon: '💳',
    invoke: async amount => {
      console.log('Processing payment...');
      await new Promise(r => setTimeout(r, 1500));
      return { success: true, transactionId: 'tx-' + Date.now() };
    },
  },
  {
    id: 'analyze-sentiment',
    name: 'Analyze Sentiment',
    provider: 'openai',
    category: 'compute',
    icon: '🧠',
    invoke: async text => {
      await new Promise(r => setTimeout(r, 2000));
      return { score: 0.8, label: 'Positive' };
    },
  },
  {
    id: 'print-label',
    name: 'Print Label',
    provider: 'zebra',
    category: 'output',
    icon: '🖨️',
    invoke: async () => {
      await new Promise(r => setTimeout(r, 800));
      return { status: 'printed' };
    },
  },
];

export const getUtility = id => utilities.find(u => u.id === id);
