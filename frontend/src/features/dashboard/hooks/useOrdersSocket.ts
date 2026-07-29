import { useEffect, useRef, useState, useCallback } from "react";

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000]; // ms, dernier délai répété ensuite
const HEARTBEAT_INTERVAL = 25000; // ping toutes les 25s

export function useOrdersSocket(restaurantId: number, onEvent: (data: any) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manuallyClosedRef = useRef(false);
  const onEventRef = useRef(onEvent);

  // toujours avoir la dernière version du callback sans recréer la connexion
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const wsUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1")
      .replace("http://", "ws://")
      .replace("https://", "wss://")
      .replace("/api/v1", "");

    const socket = new WebSocket(`${wsUrl}/ws/orders/${restaurantId}`);
    wsRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      attemptRef.current = 0;

      heartbeatTimerRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(JSON.stringify({ type: "ping" }));
          } catch {
            // ignore
          }
        }
      }, HEARTBEAT_INTERVAL);
    };

    socket.onclose = () => {
      setConnected(false);
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }

      if (manuallyClosedRef.current) return;

      const delay =
        RECONNECT_DELAYS[Math.min(attemptRef.current, RECONNECT_DELAYS.length - 1)];
      attemptRef.current += 1;

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "pong") return;
        onEventRef.current(data);
      } catch {
        // ignore parse errors
      }
    };
  }, [restaurantId]);

  useEffect(() => {
    manuallyClosedRef.current = false;
    connect();

    return () => {
      manuallyClosedRef.current = true;
      clearTimers();
      wsRef.current?.close();
    };
  }, [connect, clearTimers]);

  return { connected };
}