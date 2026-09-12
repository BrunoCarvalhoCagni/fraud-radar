import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { EnrichedTransactionEvent, SystemMetrics } from '../types';

const SOCKET_SERVER_URL = 'http://localhost:4000';
const MAX_FEED_ITEMS = 60;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<EnrichedTransactionEvent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalProcessed: 0,
    totalApproved: 0,
    totalReviewed: 0,
    totalBlocked: 0,
    totalBlockedAmount: 0,
    fraudRatePercentage: 0,
  });

  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('metrics_update', (incomingMetrics: SystemMetrics) => {
      setMetrics(incomingMetrics);
    });

    socket.on('transaction_event', (tx: EnrichedTransactionEvent) => {
      setTransactions((prev) => [tx, ...prev.slice(0, MAX_FEED_ITEMS - 1)]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { isConnected, transactions, metrics };
};