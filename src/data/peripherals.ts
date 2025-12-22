export const peripherals = [
  // Capture
  { 
    type: 'camera', 
    name: 'Camera', 
    icon: '📷', 
    utilityId: 'capture-photo',
    color: '#E91E63',
    examples: ['Sony A7IV', 'Fujifilm X-T5', 'Canon R5']
  },
  { 
    type: 'webcam', 
    name: 'Webcam', 
    icon: '🎥', 
    utilityId: 'capture-video',
    color: '#F44336',
    examples: ['Logitech C920', 'Elgato Facecam', 'Opal C1']
  },
  { 
    type: 'microphone', 
    name: 'Microphone', 
    icon: '🎙️', 
    utilityId: 'capture-audio',
    color: '#9C27B0',
    examples: ['Shure SM7B', 'Blue Yeti', 'Rode NT-USB']
  },
  
  // Output
  { 
    type: 'printer', 
    name: 'Printer', 
    icon: '🖨️', 
    utilityId: 'print-document',
    color: '#607D8B',
    examples: ['HP LaserJet', 'Canon PIXMA', 'Brother HL']
  },
  
  // Creative
  { 
    type: 'midi-keyboard', 
    name: 'MIDI Keyboard', 
    icon: '🎹', 
    utilityId: 'midi-input',
    color: '#FF5722',
    examples: ['Arturia KeyLab', 'Novation Launchkey', 'Akai MPK']
  },
  
  // Storage
  { 
    type: 'external-drive', 
    name: 'External Drive', 
    icon: '💾', 
    utilityId: 'storage-external',
    color: '#9E9E9E',
    examples: ['Samsung T7', 'SanDisk Extreme', 'LaCie Rugged']
  },
  { 
    type: 'sd-card', 
    name: 'SD Card', 
    icon: '💿', 
    utilityId: 'storage-card',
    color: '#FFEB3B',
    portType: 'sd-slot',
    examples: ['SanDisk Extreme Pro', 'Sony Tough', 'ProGrade']
  }
];

export const macbookPorts = [
  { id: 'usb-c-left-1', type: 'usb-c', position: { x: 0, y: 30 }, side: 'left', 
    compatiblePeripherals: ['camera', 'webcam', 'microphone', 'printer', 'midi-keyboard', 'external-drive'] },
  { id: 'usb-c-left-2', type: 'usb-c', position: { x: 0, y: 60 }, side: 'left',
    compatiblePeripherals: ['camera', 'webcam', 'microphone', 'printer', 'midi-keyboard', 'external-drive'] },
  { id: 'usb-c-right', type: 'usb-c', position: { x: 100, y: 45 }, side: 'right',
    compatiblePeripherals: ['camera', 'printer', 'external-drive'] },
  { id: 'sd-slot', type: 'sd-slot', position: { x: 100, y: 70 }, side: 'right',
    compatiblePeripherals: ['sd-card'] },
  { id: 'audio-jack', type: 'audio-jack', position: { x: 100, y: 20 }, side: 'right',
    compatiblePeripherals: ['headphones'] },
];

