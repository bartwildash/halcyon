import { useEffect } from 'react';
import { useReactFlow, useNodes } from '@xyflow/react';
import { usePeripherals } from './usePeripherals';

export const usePeripheralCables = () => {
  const { portState } = usePeripherals();
  const nodes = useNodes();
  const { setEdges } = useReactFlow();

  useEffect(() => {
    // 1. Identify all active peripherals
    const activePeripherals = Object.values(portState).filter(Boolean);
    if (activePeripherals.length === 0) return;

    // 2. Find device node ID (we assume there is one 'device-peripherals' node)
    const deviceNode = nodes.find(n => n.type === 'device-peripherals');
    if (!deviceNode) return;

    const newCables = [];

    // 3. Match peripherals to consumer nodes
    activePeripherals.forEach(peripheral => {
      // Find nodes that need this utility
      const consumers = nodes.filter(node => 
        node.data?.requiredUtilities?.includes(peripheral.utilityId)
      );

      consumers.forEach(consumer => {
        newCables.push({
          id: `cable-${peripheral.portId}-${consumer.id}`,
          source: deviceNode.id,
          sourceHandle: peripheral.portId, // The handle on the device node matches portId
          target: consumer.id,
          targetHandle: `utility-${peripheral.utilityId}`, // Handle on the consumer node
          type: 'peripheral-cable',
          data: {
            utilityId: peripheral.utilityId,
            peripheral,
            state: 'connected', // Simpler for now, can add connecting state later
          },
          animated: true,
        });
      });
    });

    // 4. Update edges
    setEdges(prev => {
      // Keep non-peripheral edges
      const others = prev.filter(e => e.type !== 'peripheral-cable');
      
      // Basic diffing to prevent re-renders if cables haven't changed
      const currentIds = new Set(newCables.map(c => c.id));
      const existingPeripheralEdges = prev.filter(e => e.type === 'peripheral-cable');
      const existingIds = new Set(existingPeripheralEdges.map(e => e.id));
      
      if (currentIds.size === existingIds.size && [...currentIds].every(id => existingIds.has(id))) {
        return prev;
      }

      return [...others, ...newCables];
    });

  }, [portState, nodes, setEdges]);
};

