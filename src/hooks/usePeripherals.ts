import { useState, useEffect, useCallback } from 'react';
import { peripherals, macbookPorts } from '../data/peripherals';
import { safeStorage } from '../utils/safeStorage';

// Persist state to localStorage (with safe wrapper)
const STORAGE_KEY = 'terra_peripheral_state';

export function usePeripherals() {
  const [portState, setPortState] = useState(() => {
    return safeStorage.get(STORAGE_KEY, {});
  });

  // Save on change (with safe wrapper)
  useEffect(() => {
    safeStorage.set(STORAGE_KEY, portState);
  }, [portState]);

  const connect = useCallback((portId, deviceType) => {
    const peripheralDef = peripherals.find(p => p.type === deviceType);
    if (!peripheralDef) return;

    const deviceName = peripheralDef.examples[Math.floor(Math.random() * peripheralDef.examples.length)];

    setPortState(prev => ({
      ...prev,
      [portId]: {
        portId,
        deviceType,
        deviceName,
        utilityId: peripheralDef.utilityId,
        connectedAt: Date.now(),
        color: peripheralDef.color,
        icon: peripheralDef.icon
      }
    }));
  }, []);

  const disconnect = useCallback((portId) => {
    setPortState(prev => {
      const next = { ...prev };
      delete next[portId];
      return next;
    });
  }, []);

  const cyclePort = useCallback((portId) => {
    const portDef = macbookPorts.find(p => p.id === portId);
    if (!portDef) return;

    const current = portState[portId];
    const compatible = portDef.compatiblePeripherals;
    
    if (!current) {
      // Connect first compatible
      connect(portId, compatible[0]);
    } else {
      // Find next index
      const currentIndex = compatible.indexOf(current.deviceType);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < compatible.length) {
        connect(portId, compatible[nextIndex]);
      } else {
        disconnect(portId); // Cycle back to empty
      }
    }
  }, [portState, connect, disconnect]);

  const isUtilityAvailable = useCallback((utilityId) => {
    return Object.values(portState).some(p => p.utilityId === utilityId);
  }, [portState]);

  return {
    portState,
    connect,
    disconnect,
    cyclePort,
    isUtilityAvailable
  };
}

